"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Class {
  id: string;
  name: string;
  grade_level: string;
  homeroom_teacher_id: string | null;
  homeroom_teacher?: {
    full_name: string;
  };
  created_at: string;
  academic_year: string;
}

interface Teacher {
  id: string;
  full_name: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    grade_level: "",
    homeroom_teacher_id: "",
    academic_year: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingClass
        ? `/api/classes/${editingClass.id}`
        : "/api/classes";
      const method = editingClass ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          homeroom_teacher_id: formData.homeroom_teacher_id || null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Class ${
            editingClass ? "updated" : "created"
          } successfully`,
        });
        setIsDialogOpen(false);
        setEditingClass(null);
        setFormData({ name: "", grade_level: "", homeroom_teacher_id: "", academic_year: "" });
        fetchClasses();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save class",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      grade_level: classItem.grade_level,
      homeroom_teacher_id: classItem.homeroom_teacher_id || "",
      academic_year: classItem.academic_year || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Class deleted successfully",
        });
        fetchClasses();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete class",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const columns: ColumnDef<Class>[] = [
    {
      accessorKey: "name",
      header: "Nama Kelas",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "grade_level",
      header: "Kelas",
      cell: ({ row }) => row.original.grade_level,
    },
    {
      accessorKey: "homeroom_teacher",
      header: "Guru Kelas",
      cell: ({ row }) => (
        <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">
          {row.original.homeroom_teacher?.full_name}
        </span>
      ),
    },
    {
      accessorKey: "academic_year",
      header: "Tahun Ajaran",
      cell: ({ row }) => row.original.academic_year,
    },
    {
      accessorKey: "created_at",
      header: "Dibuat",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-600">
            Manage classes and assign homeroom teachers
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingClass(null);
                setFormData({
                  name: "",
                  grade_level: "",
                  homeroom_teacher_id: "",
                  academic_year: "",
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClass ? "Edit Class" : "Add New Class"}
              </DialogTitle>
              <DialogDescription>
                {editingClass
                  ? "Update class information"
                  : "Create a new class"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Class 1A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academic_year">Tahun Ajaran</Label>
                <Input
                  id="academic_year"
                  type="text"
                  pattern="^\d{4}/\d{4}$"
                  value={formData.academic_year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academic_year: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade_level">Grade Level</Label>
                <Input
                  id="grade_level"
                  value={formData.grade_level}
                  type="number"
                  onChange={(e) =>
                    setFormData({ ...formData, grade_level: e.target.value })
                  }
                  placeholder="e.g., Grade 1, Grade 2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeroom_teacher">Homeroom Teacher</Label>
                <Select
                  value={formData.homeroom_teacher_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, homeroom_teacher_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="">No teacher assigned</SelectItem> */}
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingClass ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
          <CardDescription>All classes in the school</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={classes} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
