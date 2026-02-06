import { useRoles } from "@/hooks/useRoles";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../Button";
import { Input } from "../Input";
import { Select } from "../Select";
import { TextArea } from "../TextArea";
import { Label } from "../Label";
import { LabelInput } from "../LabelInput";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { Role } from "@/types/roles";
import { usePermissions } from "@/hooks/usePermissions";

const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required'),
    hierarchy_level: yup.number().required('Hierarchy is required'),
});

type FormData = yup.InferType<typeof schema>;

interface RoleFormProps {
    onClose: () => void;
    roleToEdit?: Role | null;
}

export const RoleForm = ({ onClose, roleToEdit }: RoleFormProps) => {
    const { t } = useTranslation();
    const { createRole, updateRole, loading } = useRoles();
    const { permissions, getPermissions } = usePermissions();
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: roleToEdit?.name || "",
            description: roleToEdit?.description || "",
            hierarchy_level: roleToEdit?.hierarchy_level || 3,
        }
    });

    useEffect(() => {
        getPermissions();
    }, []);

    useEffect(() => {
        if (roleToEdit) {
            reset({
                name: roleToEdit.name,
                description: roleToEdit.description,
                hierarchy_level: roleToEdit.hierarchy_level,
            });
            setSelectedPermissions(roleToEdit.permissions.map(p => p.id));
        } else {
            reset({
                name: "",
                description: "",
                hierarchy_level: 3,
            });
            setSelectedPermissions([]);
        }
    }, [roleToEdit, reset]);

    const hierarchyOptions = [
        { value: '3', label: 'Manager (Nivel 3)' },
        { value: '4', label: 'Support (Nivel 4)' },
    ]

    const onSubmit = async (data: FormData) => {
        try {
            if (roleToEdit) {
                await updateRole(roleToEdit.id, {
                    name: data.name,
                    description: data.description,
                    hierarchy_level: data.hierarchy_level,
                    permissions: selectedPermissions,
                });
                toast.success('Role updated successfully');
            } else {
                console.log(data.name, data.description, selectedPermissions);
                await createRole({
                    name: data.name,
                    description: data.description,
                    hierarchy_level: data.hierarchy_level,
                    permissions: selectedPermissions
                });
                toast.success('Role created successfully');
            }
            onClose();
        } catch (err: any) {
            console.error(err);
        }
    }

    const handlePermissionChange = (permissionId: number) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    }

    const renderRoleContent = () => (
        <>
            <LabelInput>
                <Label htmlFor="name">{t('common.labels.name')}</Label>
                <Input
                    id="name"
                    type="text"
                    {...register("name")}
                    placeholder={t('common.labels.name')}
                />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </LabelInput>

            <LabelInput>
                <Label htmlFor="description">{t('common.labels.description')}</Label>
                <TextArea
                    id="description"
                    {...register("description")}
                    placeholder={t('common.labels.description')}
                    rows={5}
                />
                {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
            </LabelInput>

            <LabelInput>
                <Label htmlFor="hierarchy_level">{t('common.labels.hierarchy_level')}</Label>
                <Select
                    id="hierarchy_level"
                    options={hierarchyOptions}
                    {...register("hierarchy_level")}
                />
                {errors.hierarchy_level && <span className="text-red-500 text-xs">{errors.hierarchy_level.message}</span>}
            </LabelInput>

            <div className="flex flex-col gap-2 mt-4">
                <Label>{t('roles.permissions')}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                    {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`permission-${permission.id}`}
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => handlePermissionChange(permission.id)}
                            />
                            <Label htmlFor={`permission-${permission.id}`} className="text-sm cursor-pointer">
                                {permission.name}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                    {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                    {roleToEdit ? t('common.save') : t('users.createRole')}
                </Button>
            </div>
        </>
    );

    return (
        <div className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold">{roleToEdit ? t('roles.editRole') : t('users.createRole')}</h2>
            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(onSubmit)}>
                {renderRoleContent()}
            </form>
        </div>
    )
}