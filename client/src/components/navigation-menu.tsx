import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  Menu,
  Upload,
  History,
  Code,
  BookOpen,
  FileQuestion,
  GraduationCap,
  Settings,
  Info,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { storageService } from "@/lib/storage";
import type { QuestionBank } from "@/lib/types";

interface NavigationMenuProps {
  onUploadClick?: () => void;
  onFormatGuideClick?: () => void;
  questionBanks?: QuestionBank[];
}

export function NavigationMenu({ onUploadClick, onFormatGuideClick, questionBanks = [] }: NavigationMenuProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Group question banks by category (you can add category field to banks)
  const groupedBanks = questionBanks.reduce((acc, bank) => {
    // Extract category from bank name or use a default
    const category = bank.name.includes('AWS') ? 'AWS Certifications' :
                     bank.name.includes('CompTIA') ? 'CompTIA Certifications' :
                     bank.name.includes('Example') || bank.name.includes('Demo') ? 'Examples' :
                     'Other';
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(bank);
    return acc;
  }, {} as Record<string, QuestionBank[]>);

  const navigateTo = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateTo('/')}
              className="mr-2"
            >
              <GraduationCap className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold hidden sm:block">Exam Portal</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigateTo('/')}
              className={location === '/' ? 'bg-accent' : ''}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>

            {/* Exams Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Exams
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {Object.keys(groupedBanks).length === 0 ? (
                  <DropdownMenuItem disabled>
                    <FileQuestion className="h-4 w-4 mr-2" />
                    No exams available
                  </DropdownMenuItem>
                ) : (
                  Object.entries(groupedBanks).map(([category, banks]) => (
                    <DropdownMenuSub key={category}>
                      <DropdownMenuSubTrigger>
                        <FileQuestion className="h-4 w-4 mr-2" />
                        {category}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-56">
                        {banks.map((bank) => (
                          <DropdownMenuItem
                            key={bank.id}
                            onClick={() => navigateTo(`/exam/${bank.id}`)}
                          >
                            {bank.name}
                            <span className="ml-auto text-xs text-muted-foreground">
                              {bank.questions.length}Q
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              onClick={() => navigateTo('/history')}
              className={location === '/history' ? 'bg-accent' : ''}
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>

            {/* Tools Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <Settings className="h-4 w-4 mr-2" />
                  Tools
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Manage Content</DropdownMenuLabel>
                <DropdownMenuItem onClick={onUploadClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Question Bank
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Help & Resources</DropdownMenuLabel>
                <DropdownMenuItem onClick={onFormatGuideClick}>
                  <Code className="h-4 w-4 mr-2" />
                  JSON Format Guide
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open('/bank/README.md', '_blank')}>
                  <Info className="h-4 w-4 mr-2" />
                  Full Documentation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Navigate and manage your exams</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigateTo('/')}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground px-2">Exams</p>
                    {Object.entries(groupedBanks).map(([category, banks]) => (
                      <div key={category} className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-4 py-1">
                          {category}
                        </p>
                        {banks.map((bank) => (
                          <Button
                            key={bank.id}
                            variant="ghost"
                            className="w-full justify-start pl-6"
                            onClick={() => navigateTo(`/exam/${bank.id}`)}
                          >
                            {bank.name}
                          </Button>
                        ))}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigateTo('/history')}
                  >
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>

                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-medium text-muted-foreground px-2">Tools</p>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        onUploadClick?.();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Question Bank
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        onFormatGuideClick?.();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      JSON Format Guide
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
