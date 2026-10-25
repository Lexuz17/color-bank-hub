import { sectionPaths } from "@/lib/navigation";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Info,
  Plus,
  Download,
  Palette,
  Check,
  AlertTriangle,
} from "lucide-react";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import type { AppSection, Role } from "@/components/layout/app-header";
import { ProductFormatSidebar } from "@/components/product-format/product-format-sidebar";
import {
  PageToolbar,
  SearchInput,
  ShadeSwatch,
  StatusBadge,
  EmptyState,
  LoadingState,
  WorkflowSteps,
  ImageUpload,
} from "@/components/shared/workspace-components";
import { ProductDetailPanel } from "@/components/shared/product-detail-panel";
import { useForm } from "@tanstack/react-form";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormSubmitButton } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/_authenticated/showcase")({
  component: ShowcasePage,
});

import { tableRows, sampleProfile } from "@/lib/data/demo-shades";
const paletteColumns: ColumnDef<(typeof tableRows)[number]>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all shades on page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.shade}`}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
  },
  { accessorKey: "brand", header: "Brand" },
  { accessorKey: "product", header: "Product name" },
  {
    accessorKey: "shade",
    header: "Shade name",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <ShadeSwatch hex={row.original.hex} />
        {row.original.shade}
      </span>
    ),
  },
  {
    accessorKey: "undertone",
    header: "Undertone",
    cell: ({ row }) => <StatusBadge status={row.original.undertone} />,
  },
  {
    accessorKey: "season",
    header: "Season",
    cell: ({ row }) => <StatusBadge status={row.original.season} />,
  },
];

function ShowcasePage() {
  const [progress, setProgress] = useState(68);
  const routeNavigate = useNavigate();
  const activeSection = null;
  const [format, setFormat] = useState("Lip Tint Gloss");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role>("Website Admin");
  const [profileOpen, setProfileOpen] = useState(false);
  const [workflow, setWorkflow] = useState(2);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mappingName, setMappingName] = useState("");
  const navigate = (section: AppSection) => {
    void routeNavigate({ to: sectionPaths[section] });
  };

  const form = useForm({
    defaultValues: {
      title: "",
      details: "",
      category: "brand",
    },
    onSubmit: ({ value }) => {
      toast.success("Form submitted", {
        description: `${value.title} (${value.category})`,
      });
    },
  });

  return (
    <WorkspaceLayout
      activeSection={activeSection}
      onNavigate={navigate}
      role={role}
      userName="John doe"
      onProfile={() => setProfileOpen(true)}
      sidebar={
        <ProductFormatSidebar
          value={format}
          onValueChange={(value) => {
            setFormat(value);
            toast.info(`Format: ${value}`);
          }}
          footer={
            <div className="space-y-2">
              <p className="text-[10px] text-secondary-foreground">
                Selected format: <strong>{format}</strong>
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() =>
                  document
                    .getElementById("shade-table")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <ArrowRight />
                Browse shade table
              </Button>
            </div>
          }
        />
      }
      detailPanel={
        <ProductDetailPanel
          shade={sampleProfile}
          canViewComposition={role === "Website Admin" || role === "R&D"}
        />
      }
    >
      <PageToolbar
        title={`Lip Tint › ${format}`}
        description="Shared application layout · component preview"
      >
        <SearchInput
          value={search}
          onValueChange={setSearch}
          className="w-64"
        />
      </PageToolbar>
      <div id="showcase-top" className="mx-auto w-full max-w-6xl p-5 lg:p-6">
        <div className="mb-6 rounded-lg border bg-secondary/40 p-5">
          <p className="mb-2 text-[10px] tracking-widest text-primary uppercase">
            Color Bank · UI foundations
          </p>
          <h2 className="font-display text-3xl leading-tight">
            A workspace for every shade.
          </h2>
          <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted-foreground">
            Reusable layouts, precise controls, and product components based on
            the design brief. Explore the complete component library below.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() =>
                document
                  .getElementById("shade-table")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Palette />
              Explore components
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus />
              New mapping example
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="secondary">Design System</Badge>
            <h1 className="mt-3 text-xl font-medium tracking-tight">
              Component showcase
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
              Single reference page for UI primitives, overlays, forms,
              navigation, feedback states, and data display.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Separator className="my-5" />

        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Buttons, Badges, Breadcrumb</CardTitle>
              <CardDescription>
                Core actions and hierarchy patterns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => toast.success("Primary action example")}>
                  Primary
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.info("Outline action example")}
                >
                  Outline
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => toast.info("Secondary action example")}
                >
                  Secondary
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => toast.info("Ghost action example")}
                >
                  Ghost
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => toast.error("Destructive feedback example")}
                >
                  Destructive
                </Button>
                <Button
                  variant="destructive-outline"
                  onClick={() => toast.warning("Destructive outline example")}
                >
                  Destructive outline
                </Button>
                <Button
                  variant="link"
                  onClick={() => toast.info("Link button example")}
                >
                  Link
                </Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#showcase-top">
                      Workspace
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#identity">System</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Showcase</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </CardContent>
          </Card>

          <Card id="identity">
            <CardHeader>
              <CardTitle>Avatars and Status</CardTitle>
              <CardDescription>
                Identity clusters and indicators.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AvatarGroup>
                <Avatar>
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>CB</AvatarFallback>
                </Avatar>
                <AvatarGroupCount>+4</AvatarGroupCount>
              </AvatarGroup>
              <Alert>
                <AlertTitle>Live system status</AlertTitle>
                <AlertDescription>
                  All components are rendered from shared design-system
                  primitives.
                </AlertDescription>
              </Alert>
              <Progress value={progress} aria-label="Import progress" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {progress}% complete
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() =>
                    setProgress((previous) =>
                      previous === 100 ? 0 : Math.min(100, previous + 16),
                    )
                  }
                >
                  Advance progress
                </Button>
              </div>
              <Select
                value={role}
                onValueChange={(value) => {
                  if (value) {
                    setRole(value as Role);
                  }
                }}
              >
                <SelectTrigger aria-label="Preview role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["PID", "R&D", "TSI", "Website Admin"] as const).map(
                    (item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Role preview changes navigation and composition visibility. It
                does not grant access.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inputs and Choices</CardTitle>
              <CardDescription>
                Base inputs with checkboxes, radio groups, and switches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plain-input">Plain Input</Label>
                <Input id="plain-input" placeholder="Type anything" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plain-textarea">Plain Textarea</Label>
                <Textarea
                  id="plain-textarea"
                  placeholder="Multiline notes"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plain-select">Plain Select</Label>
                <Select defaultValue="team">
                  <SelectTrigger id="plain-select" className="w-full">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="ops">Operations</SelectItem>
                    <SelectItem value="qa">QA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox defaultChecked /> Enable reviews
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch defaultChecked /> Publish mode
                </label>
              </div>
              <RadioGroup defaultValue="compact" className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="compact" /> Compact
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="comfortable" /> Comfortable
                </label>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validated shade request</CardTitle>
              <CardDescription>
                Try submitting a title with fewer than three characters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form id="form-example" form={form} className="grid gap-3">
                <Input
                  name="title"
                  label="Title"
                  placeholder="Prototype title"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      value.trim().length < 3
                        ? "Minimum 3 characters."
                        : undefined,
                  }}
                />
                <Textarea
                  name="details"
                  label="Details"
                  placeholder="Describe the request"
                  rows={3}
                />
                <Select
                  name="category"
                  label="Category"
                  options={[
                    { label: "Brand", value: "brand" },
                    { label: "Shade", value: "shade" },
                    { label: "Format", value: "format" },
                  ]}
                />
                <FormSubmitButton className="w-fit" submittingText="Saving...">
                  Submit
                </FormSubmitButton>
              </Form>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Overlays</CardTitle>
              <CardDescription>
                Dialog, alert dialog, sheet, popover, tooltip, dropdown.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger render={<Button variant="outline" />}>
                  Open Dialog
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog title</DialogTitle>
                    <DialogDescription>
                      Example dialog content with standard header/footer layout.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      onClick={() => toast.info("Dialog action demonstrated")}
                    >
                      Show feedback
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" />}>
                  Delete
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        toast.success(
                          "Example deletion confirmed; no records were changed.",
                        )
                      }
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Sheet>
                <SheetTrigger render={<Button variant="secondary" />}>
                  Open Sheet
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sheet panel</SheetTitle>
                    <SheetDescription>
                      Side panel for settings or contextual tools.
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>

              <Popover>
                <PopoverTrigger render={<Button variant="outline" />}>
                  Open Popover
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverHeader>
                    <PopoverTitle>Quick info</PopoverTitle>
                    <PopoverDescription>
                      Popovers are ideal for compact detail views.
                    </PopoverDescription>
                  </PopoverHeader>
                </PopoverContent>
              </Popover>

              <Tooltip>
                <TooltipTrigger render={<Button variant="ghost" />}>
                  Hover me
                </TooltipTrigger>
                <TooltipContent>Tooltip content</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  Open Menu
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                      Rename mapping
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        toast.info(
                          "Duplicate action demonstrated; no mapping is stored in this showcase.",
                        )
                      }
                    >
                      Duplicate example
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tabs, Accordion, Skeleton</CardTitle>
              <CardDescription>Structure and loading states.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="usage">Usage</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="overview"
                  className="pt-2 text-sm text-muted-foreground"
                >
                  Overview content panel.
                </TabsContent>
                <TabsContent
                  value="usage"
                  className="pt-2 text-sm text-muted-foreground"
                >
                  Usage content panel.
                </TabsContent>
              </Tabs>

              <Accordion defaultValue={["item-1"]}>
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is this page?</AccordionTrigger>
                  <AccordionContent>
                    A consolidated showcase of the installed component set.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardContent>
          </Card>
        </section>

        <Card id="shade-table" className="mt-4 scroll-mt-4">
          <CardHeader>
            <CardTitle>Table</CardTitle>
            <CardDescription>
              TanStack Table with sorting, filtering, and pagination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={paletteColumns}
              data={tableRows.filter((row) =>
                `${row.brand} ${row.product} ${row.shade}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )}
              searchColumn="shade"
              searchPlaceholder="Search shade names…"
              pageSize={5}
            />
          </CardContent>
        </Card>
        <section className="mt-4 grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Semantic badges & shade swatches</CardTitle>
              <CardDescription>
                Undertones, seasons, and request statuses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "Warm",
                    "Neutral",
                    "Cool",
                    "Spring",
                    "Summer",
                    "Autumn",
                    "Winter",
                    "Pending",
                    "Approved",
                    "Formulating",
                    "Closed",
                  ] as const
                ).map((status) => (
                  <StatusBadge key={status} status={status} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {tableRows.map((row) => (
                  <ShadeSwatch key={row.shade} hex={row.hex} size="lg" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card id="workflow">
            <CardHeader>
              <CardTitle>Workflow & selection</CardTitle>
              <CardDescription>
                Compact stages for requests and mapping.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <WorkflowSteps activeStep={workflow} />
              <WorkflowSteps
                steps={["Format", "Select SKUs", "Generate"]}
                activeStep={Math.min(workflow, 2)}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setWorkflow((workflow + 1) % 4)}
              >
                Next stage
              </Button>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-accent p-3">
                <p className="text-xs text-secondary-foreground">
                  5 shades selected from {format}
                </p>
                <Button size="xs" onClick={() => setDialogOpen(true)}>
                  Map selected
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card id="workspace-states">
            <CardHeader>
              <CardTitle>Empty & loading states</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <EmptyState
                  action={
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        document
                          .getElementById("shade-table")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Select shades
                    </Button>
                  }
                />
              </div>
              <div className="mt-4">
                <LoadingState />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Image uploads & notices</CardTitle>
              <CardDescription>
                Local image preview with file type and size validation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ImageUpload label="Photo on lips" />
                <ImageUpload label="Swatch photo" />
              </div>
              <Alert variant="warning">
                <AlertTriangle />
                <AlertTitle>Verification required</AlertTitle>
                <AlertDescription>
                  Sensitive permissions require administrator verification.
                </AlertDescription>
              </Alert>
              <Alert variant="success">
                <Check />
                <AlertDescription>
                  All shade values have been validated.
                </AlertDescription>
              </Alert>
              <Alert variant="info">
                <Info />
                <AlertDescription>
                  This showcase uses demonstration data.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>
        <section className="mt-4 xl:hidden">
          <Card>
            <CardHeader>
              <CardTitle>Contextual product panel</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductDetailPanel
                shade={sampleProfile}
                canViewComposition={role === "Website Admin" || role === "R&D"}
              />
            </CardContent>
          </Card>
        </section>
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-[10px] text-muted-foreground">
          <span>Color Bank & Shade Mapping Hub · Component library</span>
          <span>Reference-based layout · Local preview</span>
        </footer>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save mapping</DialogTitle>
            <DialogDescription>
              Example form interaction. This stores no product mapping.
            </DialogDescription>
          </DialogHeader>
          <label className="flex flex-col gap-2 py-1 text-xs">
            <span>Mapping name</span>
            <Input
              value={mappingName}
              onChange={(event) => setMappingName(event.target.value)}
              placeholder="Emina Glossy Stain — Full Range"
            />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!mappingName.trim()}
              onClick={() => {
                toast.success(`Example saved: ${mappingName}`);
                setDialogOpen(false);
                setMappingName("");
              }}
            >
              <Download />
              Save example
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview identity</DialogTitle>
            <DialogDescription>John doe · {role}</DialogDescription>
          </DialogHeader>
          <Alert variant="info">
            <Info />
            <AlertDescription>
              This is a local component preview. Change the preview role under
              Avatars and Status to inspect permission-aware components.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              onClick={() => {
                setProfileOpen(false);
                document
                  .getElementById("identity")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View role controls
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspaceLayout>
  );
}
