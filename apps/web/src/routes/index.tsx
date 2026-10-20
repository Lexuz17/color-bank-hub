import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
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
  AvatarImage,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/")({
  component: ShowcasePage,
});

const tableRows = [
  { item: "Atlas Swatch", owner: "Design", status: "Active" },
  { item: "Meridian Palette", owner: "Product", status: "Review" },
  { item: "North Shade", owner: "R&D", status: "Draft" },
];

function ShowcasePage() {
  const [progress] = useState(68);

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
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="secondary">Design System</Badge>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            shadcn Component Showcase
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Single reference page for UI primitives, overlays, forms,
            navigation, feedback states, and data display.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Separator className="my-8" />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Buttons, Badges, Breadcrumb</CardTitle>
            <CardDescription>
              Core actions and hierarchy patterns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
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
                  <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">System</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Showcase</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avatars and Status</CardTitle>
            <CardDescription>Identity clusters and indicators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AvatarGroup>
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/80?img=1" alt="A" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/80?img=2" alt="B" />
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
            <Progress value={progress} />
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
            <CardTitle>TanStack Form Integration</CardTitle>
            <CardDescription>
              No separate FormInput wrapper. Base Input/Textarea/Select bind by
              name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form form={form} className="grid gap-3">
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

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
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
                  <Button>Save</Button>
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
                  <AlertDialogAction>Confirm</AlertDialogAction>
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
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

            <Accordion type="single" defaultValue="item-1" collapsible>
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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Table</CardTitle>
          <CardDescription>Tabular data display primitives.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row) => (
                <TableRow key={row.item}>
                  <TableCell>{row.item}</TableCell>
                  <TableCell>{row.owner}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
