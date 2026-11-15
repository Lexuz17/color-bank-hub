import { colorMetrics } from "@color-bank-hub/contracts/color";
import { type ClassificationConfig, classifyColor } from "@color-bank-hub/contracts/color-classification";
import type { Shade } from "@color-bank-hub/contracts/shade";
import { PieChart, ScatterChart } from "echarts/charts";
import { AriaComponent, GridComponent, MarkAreaComponent, MarkLineComponent, PolarComponent, TooltipComponent } from "echarts/components";
import { type EChartsCoreOption, type EChartsType, init, use as register } from "echarts/core";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { type Ref, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { type AxisKey, axes, bordersOf, captionsOf, type Domain, domainOf, modelAxes, offsetOf, type Region, regionsOf } from "./map-axes";

// Only the parts of ECharts this map draws with, to keep the bundle small.
register([
  ScatterChart,
  PieChart,
  GridComponent,
  PolarComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TooltipComponent,
  AriaComponent,
  LabelLayout,
  CanvasRenderer,
]);

export type MapView = "season" | "color_family" | "hue_circle" | "custom";

export interface ShadeMapHandle {
  /** The map as a PNG data URL. Throws when a photo's server does not allow reading it back from the canvas. */
  png: () => string;
}

interface Props {
  ref?: Ref<ShadeMapHandle>;
  /** 1 = the map fits its box. Larger = a bigger canvas to scroll: dots keep their size, so shades that overlap move apart. */
  zoom?: number;
  /** The mouse wheel asks for the zoom to be multiplied by this. Without it the wheel scrolls the page as usual. Must be stable. */
  onWheelZoom?: (factor: number) => void;
  shades: Shade[];
  view: MapView;
  /** Custom view only. */
  axisX: AxisKey;
  axisY: AxisKey;
  /** Active cut-offs of the category; without it the map has no background. */
  config?: ClassificationConfig;
  showPhoto: boolean;
  /** Numbers on the axes of the season and color family maps, so distances can be read. */
  showScale: boolean;
  hideProductName: boolean;
  activeId: string | null;
  onOpen: (id: string) => void;
  /** Small dots without names, for a map shown as a preview. Hover still names a shade. */
  compact?: boolean;
}

const SEASON_TINTS: Record<string, string> = {
  spring: "--warning",
  summer: "--muted",
  autumn: "--secondary",
  winter: "--info",
  neutral: "--success",
};

const SIDES = [
  ["LIGHT", "top-1.5 left-1/2 -translate-x-1/2"],
  ["DEEP", "bottom-1.5 left-1/2 -translate-x-1/2"],
  ["COOL", "left-1.5 top-1/2 -translate-y-1/2 -rotate-90"],
  ["WARM", "right-1.5 top-1/2 -translate-y-1/2 rotate-90"],
];
const CIRCLE_RADIUS = "72%";

/** Hover card. Built as DOM nodes so shade names are never parsed as HTML. */
function tooltipOf(shade: Shade, numbers: string) {
  const card = document.createElement("div");
  card.style.cssText = "display:flex;gap:8px;align-items:center;font-size:11px";
  const picture = document.createElement(shade.lipPhotoUrl ? "img" : "span");
  picture.style.cssText = `width:40px;height:40px;border-radius:4px;object-fit:cover;flex:none;background:${shade.hex}`;
  if (picture instanceof HTMLImageElement && shade.lipPhotoUrl) picture.src = shade.lipPhotoUrl;
  const text = document.createElement("div");
  for (const [line, weight] of [
    [shade.name, "600"],
    [`${shade.brand.name} • ${shade.product.name}`, "400"],
    [shade.hex, "400"],
    [numbers, "400"],
  ]) {
    const row = document.createElement("div");
    row.textContent = line;
    row.style.fontWeight = weight;
    text.append(row);
  }
  card.append(picture, text);
  return card;
}

export function ShadeMap({
  ref,
  zoom = 1,
  onWheelZoom,
  shades,
  view,
  axisX,
  axisY,
  config,
  showPhoto,
  showScale,
  hideProductName,
  activeId,
  onOpen,
  compact,
}: Props) {
  const box = useRef<HTMLDivElement>(null);
  const chart = useRef<EChartsType>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  // Where the mouse was when the wheel zoomed.
  const anchor = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const instance = init(element);
    chart.current = instance;
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(element);
    return () => {
      observer.disconnect();
      instance.dispose();
    };
  }, []);

  useEffect(() => {
    const area = scroller.current;
    if (!area || !onWheelZoom) return;
    // React's onWheel is passive and cannot stop the page from scrolling too.
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = area.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      anchor.current = { x, y, left: (area.scrollLeft + x) / area.scrollWidth, top: (area.scrollTop + y) / area.scrollHeight };
      // Follows how far the wheel moved: about 10% per mouse notch, and a trackpad's many small events add up the same.
      onWheelZoom(Math.exp(-event.deltaY * 0.001));
    };
    // Drag moves a zoomed map. Not ECharts' own zoom: it drops a region line as soon as one of its ends leaves the view.
    let last: { x: number; y: number } | null = null;
    const onDown = (event: PointerEvent) => {
      if (event.button === 0) last = { x: event.clientX, y: event.clientY };
    };
    const onMove = (event: PointerEvent) => {
      if (!last) return;
      area.scrollLeft -= event.clientX - last.x;
      area.scrollTop -= event.clientY - last.y;
      last = { x: event.clientX, y: event.clientY };
    };
    const onUp = () => {
      last = null;
    };
    area.addEventListener("wheel", onWheel, { passive: false });
    area.addEventListener("pointerdown", onDown);
    area.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      area.removeEventListener("wheel", onWheel);
      area.removeEventListener("pointerdown", onDown);
      area.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [onWheelZoom]);

  // After a wheel zoom resized the canvas: keep the point under the mouse where it was.
  useLayoutEffect(() => {
    const area = scroller.current;
    const point = anchor.current;
    if (!area || !point) return;
    area.scrollLeft = point.left * area.scrollWidth - point.x;
    area.scrollTop = point.top * area.scrollHeight - point.y;
    anchor.current = null;
  }, [zoom]);

  useImperativeHandle(ref, () => ({
    png: () => {
      const background = box.current ? getComputedStyle(box.current).getPropertyValue("--card").trim() : "#fff";
      return chart.current?.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: background }) ?? "";
    },
  }));

  // Runs after every render: the option is cheap to build and ECharts diffs it.
  useEffect(() => {
    const instance = chart.current;
    const element = box.current;
    if (!instance || !element) return;
    // The canvas cannot read CSS variables, so theme tokens are resolved here.
    const style = getComputedStyle(element);
    const token = (name: string) => style.getPropertyValue(name).trim();
    const muted = token("--muted-foreground");
    const foreground = token("--foreground");
    const border = token("--border");
    const metrics = shades.map((shade) => ({ shade, values: colorMetrics(shade.hex) }));

    /** One dot (or lip photo) per shade; `at` is its position in the view's coordinates. */
    const dots = (keys: AxisKey[], at: (values: (typeof metrics)[number]["values"], shade: Shade) => number[]) =>
      metrics.map(({ shade, values }) => {
        const photo = showPhoto ? shade.lipPhotoUrl : null;
        // The circle packs shades near the center, so its dots are smaller.
        const height = photo ? 60 : compact ? 14 : view === "hue_circle" ? 24 : 30;
        const line = { fontSize: 10, lineHeight: 14, color: foreground };
        return {
          id: shade.id,
          shade,
          numbers: keys.map((key) => `${axes[key].label}: ${Math.round(values[key])}${axes[key].hue ? "°" : ""}`).join(" • "),
          value: at(values, shade),
          symbol: photo ? `image://${photo}` : "circle",
          symbolSize: photo ? [90, 60] : height,
          // Mockup: brand and product above the dot, shade name below. The gap line is as tall as the dot.
          label: compact
            ? { show: false }
            : view === "hue_circle"
              ? // Shades crowd into one sector of the circle, so only the selected one is named; hover shows the others.
                { show: shade.id === activeId, position: "bottom", formatter: () => shade.name, ...line, fontWeight: 600 }
              : {
                  formatter: () =>
                    `{top|${hideProductName ? " " : `${shade.brand.name.toUpperCase()} • ${shade.product.name}`}}\n{gap| }\n{name|${shade.name}}`,
                  rich: { top: { ...line, fontWeight: 600 }, gap: { lineHeight: height + 6 }, name: line },
                },
          itemStyle: {
            color: shade.hex,
            // Overlapping shades stay where their numbers put them; the opacity keeps both visible.
            opacity: 0.9,
            // Selected: a dark ring. The brand color is too close to lip shades to stand out.
            borderColor: shade.id === activeId ? foreground : token("--card"),
            borderWidth: shade.id === activeId ? 3 : 1,
          },
        };
      });
    const label = { show: true, position: "inside" };
    // Dots may overlap (zoom will separate them); a name that would be printed over an earlier one is hidden, hover still shows it.
    const labelLayout = { hideOverlap: true };
    const common = {
      animation: false,
      aria: { enabled: true },
      textStyle: { fontFamily: style.fontFamily },
      tooltip: {
        trigger: "item",
        backgroundColor: token("--popover"),
        borderColor: border,
        textStyle: { color: token("--popover-foreground") },
        formatter: ({ data }: { data: { shade?: Shade; numbers?: string } }) => (data.shade ? tooltipOf(data.shade, data.numbers ?? "") : ""),
      },
    };
    let option: EChartsCoreOption;

    if (view === "hue_circle") {
      // Munsell areas as a pie under the polar scatter: 0° at the top, clockwise, like the dots.
      const areas = (config?.hueMunsell.rules ?? [])
        .flatMap((rule) => (rule.hue ? [{ name: rule.label, ...rule.hue }] : []))
        .sort((a, b) => a.min - b.min);
      const slices: { name: string; value: number }[] = [];
      let cursor = areas[0]?.min ?? 0;
      for (const area of areas) {
        // An empty slice keeps the next area at its own angle when the rules leave a gap.
        if (area.min > cursor) slices.push({ name: "", value: area.min - cursor });
        const sweep = (area.max - area.min + 360) % 360 || 360;
        slices.push({ name: area.name, value: sweep });
        cursor = area.min + sweep;
      }
      option = {
        ...common,
        polar: { radius: CIRCLE_RADIUS },
        angleAxis: {
          type: "value",
          min: 0,
          max: 360,
          startAngle: 90,
          clockwise: true,
          interval: 30,
          axisLine: { lineStyle: { color: muted } },
          axisLabel: { color: muted, fontSize: 9, formatter: "{value}°" },
          splitLine: { show: false },
        },
        radiusAxis: {
          min: 0,
          // Chroma 100 is the outer ring; a more vivid shade widens it.
          max: Math.max(100, ...metrics.map(({ values }) => Math.ceil(values.lchC / 10) * 10)),
          axisLine: { show: false },
          axisLabel: { color: muted, fontSize: 9 },
          splitLine: { lineStyle: { color: border, type: "dashed" } },
        },
        series: [
          {
            type: "pie",
            silent: true,
            z: 0,
            radius: [0, CIRCLE_RADIUS],
            startAngle: 90 - (areas[0]?.min ?? 0),
            data: slices,
            itemStyle: { color: "transparent", borderColor: border, borderWidth: 1 },
            label: { position: "outside", distance: 22, fontSize: 11, fontWeight: 600, color: token("--foreground") },
            labelLine: { show: false },
          },
          // ECharts polar data is [radius, angle].
          {
            type: "scatter",
            coordinateSystem: "polar",
            data: dots(["lchH", "lchC"], (values) => [values.lchC, values.lchH]),
            label,
            labelLayout,
          },
        ],
      };
    } else {
      // Hue and lightness are read in the model the category's rules use (HSL for lips, LCh for others).
      const family = view === "color_family";
      const [keyX, keyY]: AxisKey[] =
        view === "custom"
          ? [axisX, axisY]
          : family
            ? [modelAxes[config?.colorFamily.model ?? "hsl"].hue, modelAxes[config?.valueClass.model ?? "hsl"].lightness]
            : [modelAxes[config?.season.model ?? "hsl"].hue, modelAxes[config?.season.model ?? "hsl"].lightness];
      const domainX = domainOf(
        keyX,
        metrics.map(({ values }) => values[keyX]),
      );
      const domainY = domainOf(
        keyY,
        metrics.map(({ values }) => values[keyY]),
      );
      // By color family: one column per family in rule order (a label used by two rules is one column),
      // split into one column per sub when the config gives that family sub rules.
      const families = family ? [...new Set(config?.colorFamily.rules.map((rule) => rule.label))] : [];
      const columns = families.flatMap((name): { family: string; sub: string | null }[] => {
        const subs = [...new Set(config?.colorSub?.filter((rule) => rule.family === name).map((rule) => rule.label))];
        return subs.length ? subs.map((sub) => ({ family: name, sub })) : [{ family: name, sub: null }];
      });
      // Its rows are the lightness classes, bottom to top. Rows and columns are bands of equal size, whatever their cut-offs.
      // Only lightness makes a row: a hue range on a row rule would cut every row in two. Neighbors of one name are one row.
      const bands = {
        model: config?.valueClass.model ?? "hsl",
        rules: config?.valueClass.rules.map(({ label, lightness, saturation }) => ({ label, lightness, saturation })) ?? [],
      };
      const rows: Region[] = [];
      for (const cell of family && config ? regionsOf(bands, domainX, domainY).sort((a, b) => a.y - b.y) : []) {
        const below = rows.at(-1);
        if (below?.label === cell.label) below.height += cell.height;
        else rows.push(cell);
      }
      // A hue axis is drawn as an offset from its start, so 350° and 5° sit next to each other.
      const base = (domain: Domain) => (domain.hue ? 0 : domain.start);
      // Only the custom map always shows a scale; the templates name their areas and show numbers on request.
      const scaled = view === "custom" || showScale;
      const tips = new Map<AxisKey, string>();
      // `text` turns an axis value into the number the user reads.
      const axisOf = (
        key: AxisKey,
        domain: Domain,
        text = (value: number) => (domain.hue ? `${Math.round((value + domain.start) % 360)}°` : String(Math.round(value))),
      ) => ({
        type: "value",
        show: scaled,
        name: axes[key].label,
        nameTextStyle: { color: muted, fontSize: 10 },
        min: base(domain),
        max: base(domain) + domain.span,
        axisLine: { show: true, lineStyle: { color: muted } },
        axisLabel: { color: muted, fontSize: 9, formatter: text },
        splitLine: { show: false },
        axisPointer: {
          show: scaled,
          snap: false,
          triggerTooltip: false,
          lineStyle: { color: muted, type: "dashed" },
          label: {
            fontSize: 10,
            formatter: ({ value }: { value: number }) => {
              const tip = `${axes[key].label}: ${text(Number(value))}`;
              // Copied to the corner readout: on a zoomed map these labels sit on axes that are scrolled out of view.
              tips.set(key, tip);
              if (readout.current) readout.current.textContent = [...tips.values()].join(" • ");
              return tip;
            },
          },
        },
      });
      // By color family the axes count columns and rows; these turn a position back into hue and lightness.
      const hueIn = (x: number) => {
        // Every column shows the same hue window between its 10% margins.
        const part = Math.min(1, Math.max(0, (x - Math.floor(x) - 0.1) / 0.8));
        return `${Math.round((domainX.start + part * domainX.span) % 360)}°`;
      };
      const lightnessIn = (y: number) => {
        const index = Math.min(rows.length - 1, Math.floor(y));
        const row = rows[index];
        return row ? String(Math.round(domainY.start + (row.y + (y - index) * row.height) * domainY.span)) : "";
      };
      // Hue ticks at both margins of every column; one label per column gives the window, so labels of neighbors never touch.
      const marks = columns.flatMap((_, index) => [index + 0.1, index + 0.9]);
      const familyGrid = { left: 48, right: showScale ? 64 : 28, top: 64, bottom: showScale ? 40 : 28 };
      // Pixel width of a column, to wrap a long sub name inside it.
      const columnWidth = (instance.getWidth() - familyGrid.left - familyGrid.right) / Math.max(1, columns.length);
      // Pixel height of a row, to wrap a long row name inside it.
      const rowHeight = (instance.getHeight() - familyGrid.top - familyGrid.bottom) / Math.max(1, rows.length);
      const xOf = (fraction: number) => (family ? fraction * columns.length : base(domainX) + fraction * domainX.span);
      const yOf = (fraction: number) => (family ? fraction * rows.length : base(domainY) + fraction * domainY.span);
      const at = (x: number, y: number) => ({ coord: [xOf(x), yOf(y)] });

      // No fill behind the shades: an area shows only its caption, and lines separate the areas.
      const areas: object[] = [];
      const lines: object[] = [];
      const caption = (cell: Region, name: string, label: object) =>
        areas.push([{ ...at(cell.x, cell.y), name, label }, at(cell.x + cell.width, cell.y + cell.height)]);
      const separate = (regions: Region[]) => {
        for (const [x1, y1, x2, y2] of bordersOf(regions)) lines.push([at(x1, y1), at(x2, y2)]);
      };
      const pill = (tint: string) => ({
        color: token(`${tint}-foreground`),
        backgroundColor: token(tint),
        fontSize: 11,
        fontWeight: 600,
        padding: [3, 8],
        borderRadius: 10,
      });
      if (view === "custom") {
        lines.push({ xAxis: xOf(0.5) }, { yAxis: yOf(0.5) });
      } else if (config && family) {
        // Mockup: family and lightness names are plain gray capitals outside the plot, so no shade covers them.
        const plain = { color: muted, fontSize: 11, fontWeight: 500 };
        rows.forEach((row, index) => {
          caption({ label: row.label, x: 0, y: index / rows.length, width: 1, height: 1 / rows.length }, row.label.toUpperCase(), {
            position: "left",
            distance: 12,
            rotate: 90,
            align: "center",
            verticalAlign: "middle",
            width: rowHeight - 6,
            overflow: "break",
            lineHeight: 12,
            ...plain,
          });
          if (index) lines.push({ yAxis: index });
        });
        const width = 1 / columns.length;
        columns.forEach((column, index) => {
          // A sub name sits one line under its family name.
          if (column.sub)
            caption({ label: column.sub, x: index * width, y: 0, width, height: 1 }, column.sub.toUpperCase(), {
              position: "top",
              distance: 6,
              width: columnWidth - 4,
              overflow: "break",
              lineHeight: 13,
              ...plain,
              // A narrow column: smaller letters, so one word is never cut in the middle.
              fontSize: columnWidth < 70 ? 9 : 11,
            });
          if (index) lines.push({ xAxis: index });
        });
        for (const name of families) {
          const first = columns.findIndex((column) => column.family === name);
          const span = columns.filter((column) => column.family === name).length;
          caption({ label: name, x: first * width, y: 0, width: span * width, height: 1 }, name.toUpperCase(), {
            position: "top",
            // Above a sub name of up to two lines.
            distance: 36,
            ...plain,
          });
        }
      } else if (config) {
        const regions = regionsOf(config.season, domainX, domainY);
        for (const cell of captionsOf(regions)) {
          // The pill sits in the corner nearest the edge of the map; an area that touches no edge (neutral) keeps it in the middle.
          const inner = cell.x > 0 && cell.y > 0 && cell.x + cell.width < 1 && cell.y + cell.height < 1;
          const corner = `inside${cell.y + cell.height / 2 > 0.5 ? "Top" : "Bottom"}${cell.x + cell.width / 2 < 0.5 ? "Left" : "Right"}`;
          caption(
            cell,
            cell.label.replace(/^./, (letter) => letter.toUpperCase()),
            {
              position: inner ? "inside" : corner,
              ...pill(SEASON_TINTS[cell.label] ?? "--muted"),
            },
          );
        }
        separate(regions);
      }

      option = {
        ...common,
        grid: family ? familyGrid : scaled ? { left: 48, right: 72, top: 40, bottom: 44 } : { left: 28, right: 28, top: 28, bottom: 28 },
        xAxis: family
          ? {
              ...axisOf(keyX, domainX, hueIn),
              name: "",
              min: 0,
              max: Math.max(1, columns.length),
              axisLine: { show: false },
              axisTick: { customValues: marks },
              axisLabel: {
                color: muted,
                fontSize: 9,
                formatter: () => `${hueIn(0.1)} – ${hueIn(0.9)}`,
                customValues: columns.map((_, index) => index + 0.5),
              },
            }
          : axisOf(keyX, domainX),
        yAxis: family
          ? {
              ...axisOf(keyY, domainY, lightnessIn),
              name: "",
              // On the right, away from the row names. Each row line shows the lightness where the row starts.
              position: "right",
              min: 0,
              max: Math.max(1, rows.length),
              interval: 1,
              axisLine: { show: false },
              axisTick: { show: false },
            }
          : axisOf(keyY, domainY),
        series: [
          {
            type: "scatter",
            data: dots([keyX, keyY], (values, shade) => {
              const y = base(domainY) + offsetOf(values[keyY], domainY);
              if (!family) return [base(domainX) + offsetOf(values[keyX], domainX), y];
              // Inside its row a shade sits by lightness, from the row's lower cut-off to its upper one.
              const level = offsetOf(values[keyY], domainY) / domainY.span;
              const index = Math.max(
                0,
                rows.findIndex((entry) => level <= entry.y + entry.height),
              );
              const row = rows[index] ?? { y: 0, height: 1 };
              // shortcut: a shade that no rule matches lands in the first column, the config page must require a catch-all rule.
              const color = config && classifyColor(shade.hex, config);
              const column = Math.max(
                0,
                columns.findIndex((entry) => entry.family === color?.colorFamily && entry.sub === color?.colorSub),
              );
              // Inside its column a shade sits by hue, cool to warm, with a margin so it never touches the column line.
              return [column + 0.1 + (0.8 * offsetOf(values[keyX], domainX)) / domainX.span, index + (level - row.y) / row.height];
            }),
            label,
            labelLayout,
            markArea: { silent: true, itemStyle: { color: "transparent" }, data: areas },
            // z below the scatter (2), so the lines pass behind the shades.
            markLine: { z: 1, silent: true, symbol: "none", label: { show: false }, lineStyle: { color: border, type: "solid" }, data: lines },
          },
        ],
      };
    }

    instance.setOption(option, true);
    instance.off("click");
    instance.on("click", (event) => {
      const id = (event.data as { id?: string } | undefined)?.id;
      if (id) onOpen(id);
    });
  });

  return (
    <div className="relative h-full min-h-140 w-full">
      {/* The side names below sit outside this scroll area, so they stay in view while a zoomed map moves. */}
      <div ref={scroller} className={`absolute inset-0 ${zoom > 1 ? "cursor-grab overflow-auto active:cursor-grabbing" : "overflow-hidden"}`}>
        <div ref={box} style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }} />
      </div>
      {/* Values under the mouse (filled by the axis pointers, so only while the scale is shown). */}
      {zoom > 1 && (
        <span
          ref={readout}
          className="pointer-events-none absolute bottom-5 left-3 rounded bg-foreground px-2 py-1 text-[10px] font-medium text-background empty:hidden"
        />
      )}
      {view === "season" &&
        SIDES.map(([side, position]) => (
          <span key={side} className={`pointer-events-none absolute text-[10px] font-medium tracking-wide text-muted-foreground ${position}`}>
            {side}
          </span>
        ))}
    </div>
  );
}
