import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ExternalLink, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { schemeService, GovernmentScheme } from "@/lib/schemeService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, HelpCircle, Info, Calendar as CalendarLucide } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Subsidy",
  "Loan",
  "Insurance",
  "Training",
  "Equipment",
  "Irrigation",
  "Seeds",
  "Fertilizer",
  "Marketing",
  "Other"
];

const STATES = [
  "All India",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

const APPLICATION_MODES = [
  "Online",
  "Offline",
  "Both",
  "Through Bank",
  "Through Cooperative Society",
  "Through Panchayat",
  "Other"
];

// Helper function to convert array to string for form display
const arrayToString = (arr: any[] | undefined | null): string => {
  if (!arr) return '';
  return arr.join(', ');
};

// Helper function to convert string to array for database
const stringToArray = (str: string): string[] => {
  if (!str.trim()) return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

const GovernmentSchemes = () => {
  const [search, setSearch] = useState("");
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<GovernmentScheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeState, setActiveState] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    state: "",
    description: "",
    brief: "",
    website_url: "",
    image_url: "",
    publish_date: new Date().toISOString().split("T")[0],
    application_mode: "",
    eligibility_criteria: "",
    benefits: "",
    required_documents: "",
  });
  const [formStep, setFormStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [jsonError, setJsonError] = useState({
    eligibility_criteria: false,
    benefits: false,
    required_documents: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [schemes, search, activeCategory, activeState]);

  const loadSchemes = async () => {
    try {
      setIsLoading(true);
      const data = await schemeService.getSchemes();
      setSchemes(data);
    } catch (error) {
      console.error("Error loading schemes:", error);
      toast({
        title: "Error",
        description: "Failed to load government schemes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSchemes = () => {
    let filtered = [...schemes];

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (scheme) =>
          scheme.title.toLowerCase().includes(searchLower) ||
          scheme.description.toLowerCase().includes(searchLower) ||
          (scheme.brief && scheme.brief.toLowerCase().includes(searchLower))
      );
    }

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((scheme) => scheme.category === activeCategory);
    }

    // Filter by state
    if (activeState !== "all") {
      filtered = filtered.filter((scheme) => scheme.state === activeState);
    }

    setFilteredSchemes(filtered);
  };

  const handleOpenDialog = (scheme?: GovernmentScheme) => {
    setFormStep(1);
    if (scheme) {
      setSelectedScheme(scheme);
      setDate(new Date(scheme.publish_date));
      setFormData({
        title: scheme.title,
        category: scheme.category,
        state: scheme.state,
        description: scheme.description,
        brief: scheme.brief || "",
        website_url: scheme.website_url || "",
        image_url: scheme.image_url || "",
        publish_date: new Date(scheme.publish_date).toISOString().split("T")[0],
        application_mode: scheme.application_mode || "",
        eligibility_criteria: Array.isArray(scheme.eligibility_criteria) 
          ? arrayToString(scheme.eligibility_criteria) 
          : scheme.eligibility_criteria ? JSON.stringify(scheme.eligibility_criteria, null, 2) : "",
        benefits: Array.isArray(scheme.benefits) 
          ? arrayToString(scheme.benefits) 
          : scheme.benefits ? JSON.stringify(scheme.benefits, null, 2) : "",
        required_documents: Array.isArray(scheme.required_documents) 
          ? arrayToString(scheme.required_documents) 
          : scheme.required_documents ? JSON.stringify(scheme.required_documents, null, 2) : "",
      });
    } else {
      setSelectedScheme(null);
      setDate(new Date());
      setFormData({
        title: "",
        category: "",
        state: "",
        description: "",
        brief: "",
        website_url: "",
        image_url: "",
        publish_date: new Date().toISOString().split("T")[0],
        application_mode: "",
        eligibility_criteria: "",
        benefits: "",
        required_documents: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const parseJsonField = (value: string, fieldName: keyof typeof jsonError) => {
    if (!value.trim()) return undefined;
    
    try {
      // First try to parse as JSON
      try {
        const parsed = JSON.parse(value);
        setJsonError(prev => ({ ...prev, [fieldName]: false }));
        return parsed;
      } catch (e) {
        // If not valid JSON, treat as comma-separated list
        const array = stringToArray(value);
        setJsonError(prev => ({ ...prev, [fieldName]: false }));
        return array;
      }
    } catch (error) {
      setJsonError(prev => ({ ...prev, [fieldName]: true }));
      return stringToArray(value); // Fallback to simple array
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      setFormData(prev => ({
        ...prev,
        publish_date: date.toISOString().split('T')[0]
      }));
    }
  };

  const nextStep = () => {
    if (formStep < 3) {
      setFormStep(formStep + 1);
    }
  };

  const prevStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.title.trim() && !!formData.category && !!formData.state;
      case 2:
        return !!formData.description.trim() && !!formData.publish_date;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate all required fields
      if (!formData.title.trim() || !formData.category || !formData.state || !formData.description.trim() || !formData.publish_date) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Check for JSON parsing errors
      if (jsonError.eligibility_criteria || jsonError.benefits || jsonError.required_documents) {
        toast({
          title: "Validation Error",
          description: "Please fix the formatting errors in JSON fields",
          variant: "destructive",
        });
        return;
      }

      const schemeData = {
        title: formData.title.trim(),
        category: formData.category,
        state: formData.state,
        description: formData.description.trim(),
        brief: formData.brief.trim() || undefined,
        website_url: formData.website_url.trim() || undefined,
        image_url: formData.image_url.trim() || undefined,
        publish_date: formData.publish_date,
        application_mode: formData.application_mode || undefined,
        eligibility_criteria: parseJsonField(formData.eligibility_criteria, "eligibility_criteria"),
        benefits: parseJsonField(formData.benefits, "benefits"),
        required_documents: parseJsonField(formData.required_documents, "required_documents"),
      };

      if (selectedScheme) {
        await schemeService.updateScheme(selectedScheme.id, schemeData);
        toast({
          title: "Success",
          description: "Scheme updated successfully",
        });
      } else {
        await schemeService.createScheme(schemeData);
        toast({
          title: "Success",
          description: "Scheme created successfully",
        });
      }
      setIsDialogOpen(false);
      loadSchemes();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: selectedScheme ? "Failed to update scheme" : "Failed to create scheme",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (scheme: GovernmentScheme) => {
    if (confirm("Are you sure you want to delete this scheme?")) {
      try {
        await schemeService.deleteScheme(scheme.id);
        toast({
          title: "Success",
          description: "Scheme deleted successfully",
        });
        loadSchemes();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete scheme",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render form step content
  const renderStepContent = () => {
    switch (formStep) {
      case 1:
        return (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="flex items-center">
                  Title <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter scheme title"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category" className="flex items-center">
                    Category <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state" className="flex items-center">
                    State <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => handleSelectChange("state", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="brief" className="flex items-center">
                  Brief Summary
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-sm">A short summary that will be displayed in cards and listings.</p>
                    </PopoverContent>
                  </Popover>
                </Label>
                <Textarea
                  id="brief"
                  name="brief"
                  value={formData.brief}
                  onChange={handleInputChange}
                  placeholder="Enter a brief summary of the scheme"
                  rows={2}
                />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description" className="flex items-center">
                  Full Description <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter detailed description of the scheme"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="publish_date" className="flex items-center">
                    Publish Date <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="application_mode">
                    Application Mode
                  </Label>
                  <Select
                    value={formData.application_mode}
                    onValueChange={(value) => handleSelectChange("application_mode", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select application mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="website_url">
                    Website URL
                  </Label>
                  <Input
                    id="website_url"
                    name="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    placeholder="https://example.gov.in/scheme"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image_url">
                    Image URL
                  </Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="grid gap-4 py-4">
              <Accordion type="single" collapsible className="w-full" defaultValue="eligibility">
                <AccordionItem value="eligibility">
                  <AccordionTrigger className="text-base font-medium">
                    Eligibility Criteria
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm text-gray-600">
                        Enter as comma-separated values or valid JSON array
                      </span>
                    </div>
                    <Textarea
                      id="eligibility_criteria"
                      name="eligibility_criteria"
                      value={formData.eligibility_criteria}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder='Farmer with land, Age between 18-65, Valid ID proof'
                      className={jsonError.eligibility_criteria ? "border-red-500" : ""}
                    />
                    {jsonError.eligibility_criteria && (
                      <p className="text-red-500 text-sm mt-1">
                        Invalid format. Use comma-separated values or valid JSON.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="benefits">
                  <AccordionTrigger className="text-base font-medium">
                    Benefits
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm text-gray-600">
                        Enter as comma-separated values or valid JSON array
                      </span>
                    </div>
                    <Textarea
                      id="benefits"
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder='50% subsidy on equipment, Low interest loans, Free training'
                      className={jsonError.benefits ? "border-red-500" : ""}
                    />
                    {jsonError.benefits && (
                      <p className="text-red-500 text-sm mt-1">
                        Invalid format. Use comma-separated values or valid JSON.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="documents">
                  <AccordionTrigger className="text-base font-medium">
                    Required Documents
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm text-gray-600">
                        Enter as comma-separated values or valid JSON array
                      </span>
                    </div>
                    <Textarea
                      id="required_documents"
                      name="required_documents"
                      value={formData.required_documents}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder='Aadhaar Card, Land Records, Bank Account Details'
                      className={jsonError.required_documents ? "border-red-500" : ""}
                    />
                    {jsonError.required_documents && (
                      <p className="text-red-500 text-sm mt-1">
                        Invalid format. Use comma-separated values or valid JSON.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Government Schemes</h1>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={viewMode === "grid" ? "bg-primary text-white" : ""}
                  onClick={() => setViewMode("grid")}
                >
                  Grid View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={viewMode === "list" ? "bg-primary text-white" : ""}
                  onClick={() => setViewMode("list")}
                >
                  List View
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  ADD NEW SCHEME
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <SearchBar 
                value={search} 
                onChange={setSearch} 
                placeholder="Search schemes by title or description..." 
              />
            </div>

            <div className="mb-6">
              <Tabs defaultValue="all" onValueChange={setActiveCategory}>
                <TabsList className="mb-4 flex flex-wrap">
                  <TabsTrigger value="all">All Categories</TabsTrigger>
                  {CATEGORIES.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="mb-6">
              <Select value={activeState} onValueChange={setActiveState}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">Loading schemes...</div>
            ) : filteredSchemes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No schemes found</div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchemes.map((scheme) => (
                  <Card key={scheme.id} className="overflow-hidden">
                    {scheme.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={scheme.image_url}
                          alt={scheme.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="mb-2">{scheme.category}</Badge>
                          <CardTitle className="text-xl">{scheme.title}</CardTitle>
                        </div>
                      </div>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {scheme.state}
                      </CardDescription>
                      <CardDescription className="flex items-center">
                        <CalendarLucide className="h-4 w-4 mr-1" />
                        {formatDate(scheme.publish_date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {scheme.brief || scheme.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary hover:text-primary-foreground hover:bg-primary"
                          onClick={() => handleOpenDialog(scheme)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          onClick={() => handleDelete(scheme)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                      {scheme.website_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600"
                          onClick={() => window.open(scheme.website_url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visit
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scheme
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        State
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Publish Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSchemes.map((scheme) => (
                      <tr key={scheme.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {scheme.image_url && (
                              <img
                                src={scheme.image_url}
                                alt={scheme.title}
                                className="h-10 w-10 rounded-md mr-3 object-cover"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{scheme.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {scheme.brief || scheme.description.substring(0, 100)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge>{scheme.category}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {scheme.state}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(scheme.publish_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-primary hover:text-primary-foreground hover:bg-primary"
                              onClick={() => handleOpenDialog(scheme)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                              onClick={() => handleDelete(scheme)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                            {scheme.website_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600"
                                onClick={() => window.open(scheme.website_url, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Visit
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedScheme ? "Edit Scheme" : "Add New Scheme"}</DialogTitle>
              <DialogDescription>
                {selectedScheme
                  ? "Update the government scheme information below."
                  : "Fill in the details to add a new government scheme."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="relative">
                {/* Step indicator */}
                <div className="mb-6 pt-4">
                  <div className="flex items-center justify-between">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex flex-col items-center">
                        <div 
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            formStep === step 
                              ? "bg-primary text-white" 
                              : formStep > step 
                                ? "bg-green-500 text-white" 
                                : "bg-gray-200 text-gray-600"
                          )}
                        >
                          {formStep > step ? "✓" : step}
                        </div>
                        <span className="text-xs mt-1">
                          {step === 1 ? "Basic Info" : step === 2 ? "Details" : "Additional"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
                    <div 
                      className="h-1 bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${((formStep - 1) / 2) * 100}%` }}
                    />
                  </div>
                </div>

                {renderStepContent()}

                <div className="flex justify-between mt-6">
                  {formStep > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  )}
                  
                  {formStep < 3 ? (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={!validateStep(formStep)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="submit">
                      {selectedScheme ? "Update Scheme" : "Add Scheme"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GovernmentSchemes; 