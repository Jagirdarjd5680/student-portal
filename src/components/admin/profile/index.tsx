"use client";

import ComponentCard from "@/components/common/component-card";
import FormAlert from "@/components/admin/shared/form-alert";
import FormField from "@/components/admin/shared/form-field";
import PhoneInput from "@/components/admin/shared/phone-input";
import PhotoInput from "@/components/admin/shared/photo-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/hooks/use-can";
import { UserIcon } from "@/icons";
import { saveToken, updateStoredAdmin } from "@/lib/auth";
import { toFormData } from "@/lib/api-client";
import { fileUrl } from "@/lib/config";
import { errorMessage, stripLeadingZeros } from "@/lib/format";
import { authService } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
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
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please re-enter the new password"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });
type PasswordForm = z.infer<typeof passwordSchema>;

type Msg = { type: "success" | "error"; text: string } | null;

function ProfileCard() {
  const admin = useAdmin();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>();
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoKey, setPhotoKey] = useState(0);
  const [msg, setMsg] = useState<Msg>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: admin?.name || "",
      email: admin?.email || "",
      phone: admin?.phone || "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setMsg(null);
    try {
      const body = toFormData(
        { ...data, remove_photo: removePhoto ? "true" : "" },
        { photo },
      );
      const res = await authService.updateProfile(body);
      updateStoredAdmin(res.admin); // header avatar, name and menus update at once
      setPhoto(null);
      setRemovePhoto(false);
      setPhotoKey((k) => k + 1);
      setMsg({ type: "success", text: "Profile updated." });
    } catch (err) {
      setMsg({ type: "error", text: errorMessage(err) });
    }
  };

  const current = removePhoto ? "" : fileUrl(admin?.photo);

  return (
    <ComponentCard title="My Profile" className="xl:col-span-3">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormAlert type={msg?.type ?? "success"} message={msg?.text} />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
            {current && !photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current} alt="" className="size-full object-cover" />
            ) : (
              <UserIcon className="size-12 text-gray-400" />
            )}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <PhotoInput
              file={photo}
              resetKey={photoKey}
              onChange={(f, err) => {
                setPhoto(f);
                setPhotoError(err);
                if (f) setRemovePhoto(false);
              }}
            />
            {photoError && <p className="text-xs text-red-500">{photoError}</p>}
            {admin?.photo && !photo && (
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => setRemovePhoto((r) => !r)}
              >
                {removePhoto ? "Keep current photo" : "Remove photo"}
              </Button>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              A new photo replaces the old one (the old file is deleted from the
              server).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label="Name" required error={errors.name?.message}>
            <Input {...register("name")} placeholder="Your name" />
          </FormField>
          <FormField
            label="Email (login ID)"
            required
            error={errors.email?.message}
          >
            <Input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
            />
          </FormField>
          <FormField label="Phone Number" error={errors.phone?.message}>
            <PhoneInput {...register("phone")} placeholder="Phone number" />
          </FormField>
          <FormField label="Role">
            <div className="flex h-11 items-center">
              <Badge
                size="sm"
                color={admin?.is_super === false ? "primary" : "success"}
              >
                {admin?.role_name ||
                  (admin?.is_super === false ? "Staff" : "Super Admin")}
              </Badge>
            </div>
          </FormField>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}

function PasswordCard() {
  const [msg, setMsg] = useState<Msg>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: PasswordForm) => {
    setMsg(null);
    try {
      const res = await authService.changePassword(data);
      saveToken(res.token); // this device stays signed in; other devices are signed out
      reset();
      setMsg({ type: "success", text: "Password changed successfully." });
    } catch (err) {
      setMsg({ type: "error", text: errorMessage(err) });
    }
  };

  return (
    <ComponentCard title="Change Password" className="xl:col-span-2">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormAlert type={msg?.type ?? "success"} message={msg?.text} />
        <FormField
          label="Current Password"
          required
          error={errors.current_password?.message}
        >
          <Input
            {...register("current_password")}
            type="password"
            autoComplete="current-password"
          />
        </FormField>
        <FormField
          label="New Password"
          required
          error={errors.new_password?.message}
        >
          <Input
            {...register("new_password")}
            type="password"
            autoComplete="new-password"
            placeholder="Min 6 characters"
          />
        </FormField>
        <FormField
          label="Re-enter New Password"
          required
          error={errors.confirm_password?.message}
        >
          <Input
            {...register("confirm_password")}
            type="password"
            autoComplete="new-password"
          />
        </FormField>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          {isSubmitting ? "Saving..." : "Change Password"}
        </Button>
      </form>
    </ComponentCard>
  );
}

// Same page for the Super Admin and for every custom-role user: own details, photo, password.
export default function ProfilePage() {
  const admin = useAdmin();
  // Mount the form once the stored profile is available so it starts with the right values.
  if (!admin) return null;
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <ProfileCard key={admin.id} />
      <PasswordCard />
    </div>
  );
}
