import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Play,
  Mail,
  Printer,
  Search,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertCircle,
  Package,
  Wrench,
  Thermometer,
  Zap,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  lastRun?: Date;
  scheduled?: boolean;
}

const reportTemplates: ReportTemplate[] = [
  { id: "shift", name: "Shift Production Report", description: "Production summary for current/previous shift", category: "production", icon: BarChart3 },
  { id: "daily", name: "Daily Production Summary", description: "Comprehensive daily production metrics", category: "production", icon: TrendingUp },
  { id: "oee", name: "OEE Report", description: "Overall Equipment Effectiveness analysis", category: "production", icon: PieChart, scheduled: true },
  { id: "downtime", name: "Downtime Analysis", description: "Downtime events with root cause analysis", category: "production", icon: AlertCircle },
  { id: "alarm", name: "Alarm Summary Report", description: "Alarm statistics and top offenders", category: "alarms", icon: AlertCircle, scheduled: true },
  { id: "batch", name: "Batch Record Report", description: "Complete electronic batch record", category: "batch", icon: Package },
  { id: "quality", name: "Quality Report", description: "SPC charts and defect analysis", category: "quality", icon: TrendingUp },
  { id: "maintenance", name: "Maintenance Report", description: "PM compliance and equipment reliability", category: "maintenance", icon: Wrench, scheduled: true },
  { id: "environmental", name: "Environmental Report", description: "Temperature/humidity excursions", category: "environmental", icon: Thermometer },
  { id: "utility", name: "Utility Consumption Report", description: "Energy and utility usage analysis", category: "utilities", icon: Zap, scheduled: true },
  { id: "audit", name: "Audit Trail Report", description: "User activity and system changes", category: "compliance", icon: Users },
];

const recentReports = [
  { id: 1, name: "Shift Production Report", date: new Date(Date.now() - 3600000), status: "completed", user: "J. Smith" },
  { id: 2, name: "Daily Production Summary", date: new Date(Date.now() - 86400000), status: "completed", user: "System" },
  { id: 3, name: "OEE Report", date: new Date(Date.now() - 172800000), status: "completed", user: "M. Johnson" },
  { id: 4, name: "Alarm Summary Report", date: new Date(Date.now() - 259200000), status: "completed", user: "System" },
];

export function ReportsModule() {
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredReports = reportTemplates.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(reportTemplates.map((r) => r.category))];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Reports Generated Today</p>
            <p className="text-2xl font-bold font-mono">12</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-status-normal">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Scheduled Reports</p>
            <p className="text-2xl font-bold font-mono">4</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-status-info">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Report Templates</p>
            <p className="text-2xl font-bold font-mono">{reportTemplates.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-muted-foreground">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Pending Exports</p>
            <p className="text-2xl font-bold font-mono">0</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Report Selection */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Report Templates</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-48"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="capitalize">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="grid md:grid-cols-2 gap-3">
                    {filteredReports.map((report) => {
                      const Icon = report.icon;
                      return (
                        <div
                          key={report.id}
                          onClick={() => setSelectedReport(report)}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all",
                            selectedReport?.id === report.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-secondary">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{report.name}</span>
                                {report.scheduled && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" /> Scheduled
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                              <Badge variant="outline" className="mt-2 capitalize text-xs">
                                {report.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Report Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Report Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedReport ? (
                  <>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="font-medium">{selectedReport.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                    </div>

                    <div>
                      <Label>Date Range</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <Label className="text-xs text-muted-foreground">From</Label>
                          <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">To</Label>
                          <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Shift</Label>
                      <Select defaultValue="all">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Shifts</SelectItem>
                          <SelectItem value="day">Day Shift</SelectItem>
                          <SelectItem value="evening">Evening Shift</SelectItem>
                          <SelectItem value="night">Night Shift</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Equipment/Area</Label>
                      <Select defaultValue="all">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Equipment</SelectItem>
                          <SelectItem value="molding">Molding</SelectItem>
                          <SelectItem value="assembly">Assembly</SelectItem>
                          <SelectItem value="packaging">Packaging</SelectItem>
                          <SelectItem value="sterilization">Sterilization</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Output Format</Label>
                      <Select defaultValue="pdf">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1 gap-2">
                        <Play className="w-4 h-4" /> Generate
                      </Button>
                      <Button variant="outline" size="icon">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Select a report template</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recently Generated Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg"
                  >
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{report.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Generated by {report.user} • {report.date.toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-status-normal">{report.status}</Badge>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Scheduled Reports</CardTitle>
                <Button size="sm" className="gap-2">
                  <Calendar className="w-4 h-4" /> Add Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Daily Production Summary", schedule: "Daily at 07:00", recipients: "production@company.com", nextRun: "Tomorrow 07:00" },
                  { name: "OEE Report", schedule: "Weekly (Monday)", recipients: "management@company.com", nextRun: "Monday 08:00" },
                  { name: "Maintenance Report", schedule: "Monthly (1st)", recipients: "maintenance@company.com", nextRun: "Feb 1, 08:00" },
                  { name: "Alarm Summary Report", schedule: "Daily at 23:00", recipients: "operations@company.com", nextRun: "Today 23:00" },
                ].map((schedule, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg"
                  >
                    <Clock className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{schedule.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {schedule.schedule} • {schedule.recipients}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Next Run</p>
                      <p className="text-xs text-muted-foreground">{schedule.nextRun}</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}