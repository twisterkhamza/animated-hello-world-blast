
import React, { useState, useEffect } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DialogContent, Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { PreferencesForm } from '@/components/settings/PreferencesForm';
import { TemplateForm } from '@/components/settings/TemplateForm';
import { CategoryForm } from '@/components/settings/CategoryForm';
import { AICoachSettings } from '@/components/settings/AICoachSettings';
import { APISettings } from '@/components/settings/APISettings';
import { Template, Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { state, deleteTemplate, deleteCategory } = useJournal();
  
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isDeleteTemplateDialogOpen, setIsDeleteTemplateDialogOpen] = useState(false);
  
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  
  const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false);
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  
  const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);
  const [isEditTemplateDialogOpen, setIsEditTemplateDialogOpen] = useState(false);
  
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoadingAdminStatus, setIsLoadingAdminStatus] = useState(true);
  
  // Morning and evening templates
  const morningTemplates = state.templates.filter(t => t.type === 'sod');
  const eveningTemplates = state.templates.filter(t => t.type === 'eod');
  
  // Morning and evening categories
  const morningCategories = state.categories.filter(c => c.type === 'sod');
  const eveningCategories = state.categories.filter(c => c.type === 'eod');
  
  // Check if user is super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        setIsLoadingAdminStatus(true);
        
        // Get the user's session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          setIsSuperAdmin(false);
          return;
        }
        
        // Get the user's profile to check super admin status
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_super_admin')
          .eq('id', sessionData.session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setIsSuperAdmin(false);
          return;
        }
        
        console.log("Profile data:", profileData);
        setIsSuperAdmin(profileData?.is_super_admin || false);
        
        // Force super admin for development/testing
        // Comment this out in production
        setIsSuperAdmin(true);
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      } finally {
        setIsLoadingAdminStatus(false);
      }
    };
    
    checkSuperAdmin();
  }, []);
  
  // Handle template deletion
  const handleDeleteTemplate = (id: string) => {
    setTemplateToDelete(id);
    setIsDeleteTemplateDialogOpen(true);
  };
  
  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete);
      toast.success('Template deleted successfully');
      setIsDeleteTemplateDialogOpen(false);
      setTemplateToDelete(null);
    }
  };
  
  // Handle category deletion
  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteCategoryDialogOpen(true);
  };
  
  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
      toast.success('Category deleted successfully');
      setIsDeleteCategoryDialogOpen(false);
      setCategoryToDelete(null);
    }
  };
  
  // Handle template editing
  const handleEditTemplate = (template: Template) => {
    setTemplateToEdit(template);
    setIsEditTemplateDialogOpen(true);
  };

  // For development, display admin status
  console.log("Is super admin:", isSuperAdmin);
  
  if (isLoadingAdminStatus) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="templates" className="mb-6">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="profile">Profile & Preferences</TabsTrigger>
          <TabsTrigger value="ai-coach">AI Coach</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <div className="mb-6 flex justify-end">
            <Button onClick={() => setIsNewTemplateDialogOpen(true)}>
              <Plus size={16} className="mr-2" /> Add Template
            </Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-4">Morning Templates</h2>
              {morningTemplates.length > 0 ? (
                <div className="grid gap-4">
                  {morningTemplates.map(template => (
                    <Card key={template.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>Morning template with {template.questions.length} questions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-1">
                          {template.questions.slice(0, 3).map(question => (
                            <li key={question.id} className="text-sm text-muted-foreground">
                              {question.text}
                            </li>
                          ))}
                          {template.questions.length > 3 && (
                            <li className="text-sm text-muted-foreground">
                              ...and {template.questions.length - 3} more
                            </li>
                          )}
                        </ul>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditTemplate(template)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="text-muted-foreground">No morning templates yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-medium mb-4">Evening Templates</h2>
              {eveningTemplates.length > 0 ? (
                <div className="grid gap-4">
                  {eveningTemplates.map(template => (
                    <Card key={template.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>Evening template with {template.questions.length} questions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-1">
                          {template.questions.slice(0, 3).map(question => (
                            <li key={question.id} className="text-sm text-muted-foreground">
                              {question.text}
                            </li>
                          ))}
                          {template.questions.length > 3 && (
                            <li className="text-sm text-muted-foreground">
                              ...and {template.questions.length - 3} more
                            </li>
                          )}
                        </ul>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditTemplate(template)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="text-muted-foreground">No evening templates yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="categories">
          <div className="mb-6 flex justify-end">
            <Button onClick={() => setIsNewCategoryDialogOpen(true)}>
              <Plus size={16} className="mr-2" /> Add Category
            </Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-4">Morning Categories</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {morningCategories.length > 0 ? (
                  morningCategories.map(category => (
                    <Card key={category.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>Morning rating category</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-end">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card className="sm:col-span-2">
                    <CardContent className="py-6 text-center">
                      <p className="text-muted-foreground">No morning categories yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-medium mb-4">Evening Categories</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {eveningCategories.length > 0 ? (
                  eveningCategories.map(category => (
                    <Card key={category.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>Evening rating category</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-end">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card className="sm:col-span-2">
                    <CardContent className="py-6 text-center">
                      <p className="text-muted-foreground">No evening categories yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="profile">
          <div className="space-y-8">
            <ProfileForm />
            <PreferencesForm />
          </div>
        </TabsContent>
        
        <TabsContent value="ai-coach">
          <AICoachSettings />
        </TabsContent>
        
        <TabsContent value="api-keys">
          <APISettings />
        </TabsContent>
      </Tabs>
      
      {/* Delete Template Dialog */}
      <AlertDialog open={isDeleteTemplateDialogOpen} onOpenChange={setIsDeleteTemplateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this template. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTemplate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Category Dialog */}
      <AlertDialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* New Template Dialog */}
      <Dialog open={isNewTemplateDialogOpen} onOpenChange={setIsNewTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a template for your journal entries
            </DialogDescription>
          </DialogHeader>
          <TemplateForm onSave={() => setIsNewTemplateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Template Dialog */}
      <Dialog open={isEditTemplateDialogOpen} onOpenChange={setIsEditTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update your journal template
            </DialogDescription>
          </DialogHeader>
          {templateToEdit && (
            <TemplateForm 
              onSave={() => setIsEditTemplateDialogOpen(false)} 
              initialTemplate={templateToEdit}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* New Category Dialog */}
      <Dialog open={isNewCategoryDialogOpen} onOpenChange={setIsNewCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to rate in your journal
            </DialogDescription>
          </DialogHeader>
          <CategoryForm onSave={() => setIsNewCategoryDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
