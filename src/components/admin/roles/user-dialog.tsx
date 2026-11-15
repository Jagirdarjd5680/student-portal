"use client";

import FormField from "@/components/admin/shared/form-field";
import PhoneInput from "@/components/admin/shared/phone-input";
import FormAlert from "@/components/admin/shared/form-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Permissions } from "@/data/permissions";
import { errorMessage, stripLeadingZeros } from "@/lib/format";
import { userService, type StaffUser } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import SelectBox from "@/components/admin/shared/select-field";
import PermissionMatrix from "./permission-matrix";

const SCOPE_OPTIONS = [
  { label: "All records (everyone's data)", value: "all" },
  { label: "Only records added by this user", value: "own" },
];

const CATEGORY_OPTIONS = [
  { label: "Receptionist", value: "receptionist" },
  { label: "Other", value: "other" },
];

const schema = (editing: boolean) =>
  z.object({
    role_name: z.string().trim().min(1, "Role Name is required"),
    category: z.enum(["receptionist", "other"]),
    data_scope: z.enum(["all", "own"]),
    name: z.string().trim().min(1, "User Name is required"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    password: editing
      ? z
          .string()
          .refine(
            (v) => v === "" || v.length >= 8,
            "Password must be at least 8 characters",
          )
      : z.string().min(8, "Password must be at least 8 characters"),
    phone: z
      .string()
      .transform(stripLeadingZeros)
      .pipe(
        z
          .string()
          .trim()
          .regex(/^([0-9+\-\s]{7,15})?$/, "Please enter a valid phone number"),
      ),
  });

type FormData = z.infer<ReturnType<typeof schema>>;

interface UserDialogProps {
  open: boolean;
  user: StaffUser | null; // null = create
  onClose: () => void;
  onSaved: () => void;
}

// Create / edit a staff user: role name, login details and module permissions.
export default function UserDialog({
  open,
  user,
  onClose,
  onSaved,
}: UserDialogProps) {
  const editing = Boolean(user);
  // Mounted fresh on every open (see parent), so initial state comes from props.
  const [permissions, setPermissions] = useState<Permissions>(
    user?.permissions || {},
  );
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema(editing)),
    defaultValues: {
      role_name: user?.role_name || "",
      category: user?.category || "other",
      data_scope: user?.data_scope || "all",
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const body = { ...data, permissions };
      if (user) await userService.update(user.id, body);
      else await userService.create(body);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Role & User" : "Create Role"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="user-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          <FormAlert type="error" message={error} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Role Name"
              required
              error={errors.role_name?.message}
            >
              <Input
                {...register("role_name")}
                placeholder="e.g. Receptionist"
                disabled={user?.is_super}
              />
            </FormField>
            <FormField label="Category">
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <SelectBox
                    options={CATEGORY_OPTIONS}
                    value={field.value}
                    onChange={(v) => field.onChange(v || "other")}
                    placeholder="Category"
                  />
                )}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {
                  "Receptionists appear in the Receptionist dropdown of Inquiry and Admission forms."
                }
              </p>
            </FormField>
            <FormField label="Data Visibility" className="sm:col-span-2">
              <Controller
                control={control}
                name="data_scope"
                render={({ field }) => (
                  <SelectBox
                    options={SCOPE_OPTIONS}
                    value={field.value}
                    onChange={(v) => field.onChange(v || "all")}
                    placeholder="Data visibility"
                    disabled={user?.is_super}
                  />
                )}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {
                  '"Only records added by this user": the panel starts empty and shows (and lets them change) only the inquiries, admissions, students, payments and refunds they add themselves, within their permissions. "All records": they also see what others added.'
                }
              </p>
            </FormField>

            <FormField label="User Name" required error={errors.name?.message}>
              <Input {...register("name")} placeholder="Full name" />
            </FormField>
            <FormField
              label="Email (login ID)"
              required
              error={errors.email?.message}
            >
              <Input
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                autoComplete="off"
              />
            </FormField>
            <FormField
              label={
                editing ? "New Password (leave blank to keep)" : "Password"
              }
              required={!editing}
              error={errors.password?.message}
            >
              <Input
                {...register("password")}
                type="password"
                placeholder="Min 6 characters"
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Phone Number" error={errors.phone?.message}>
              <PhoneInput {...register("phone")} placeholder="Phone number" />
            </FormField>
          </div>

          <div>
            <h4 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">
              Permissions
            </h4>
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
              {user?.is_super
                ? "Super Admin always has full access to everything."
                : "Tick “Full access” for complete permission on a module, or choose single actions. Add / Edit / Delete also give View."}
            </p>
            <PermissionMatrix
              value={permissions}
              onChange={setPermissions}
              disabled={user?.is_super}
            />
          </div>
        </form>

        <DialogFooter className="mx-0 mb-0 p-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" loading={isSubmitting}>
            {isSubmitting ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
