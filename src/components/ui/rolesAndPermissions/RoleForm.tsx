import { useRoles } from "@/hooks/useRoles";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../Button";
import { Input } from "../Input";
import { TextArea } from "../TextArea";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { Role } from "@/types/roles";
import { usePermissions } from "@/hooks/usePermissions";

const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required'),
});

type FormData = yup.InferType<typeof schema>;

interface RoleFormProps {
    onClose: () => void;
    onSuccess?: () => void;
    roleToEdit?: Role | null;
}

export const RoleForm = ({ onClose, onSuccess, roleToEdit }: RoleFormProps) => {
    const { t } = useTranslation();
    const { createRole, updateRole, loading } = useRoles();
    const { permissions, getPermissions } = usePermissions();
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: roleToEdit?.name || "",
            description: roleToEdit?.description || "",
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
            });
            setSelectedPermissions(roleToEdit.permissions.map(p => p.id));
        } else {
            reset({
                name: "",
                description: "",
            });
            setSelectedPermissions([]);
        }
    }, [roleToEdit, reset]);



    const onSubmit = async (data: FormData) => {
        try {
            if (roleToEdit) {
                await updateRole(roleToEdit.id, {
                    name: data.name,
                    description: data.description,
                    permissions: selectedPermissions,
                });
                toast.success(t('common.messages.updateSuccess'));
            } else {
                console.log(data.name, data.description, selectedPermissions);
                await createRole({
                    name: data.name,
                    description: data.description,
                    permissions: selectedPermissions
                });
                toast.success(t('common.messages.createSuccess'));
            }
            if (onSuccess) onSuccess();
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

            <Input
                id="name"
                type="text"
                {...register("name")}
                placeholder={t('common.labels.name')}
                className="w-full"
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}

            <TextArea
                id="description"
                {...register("description")}
                placeholder={t('common.labels.description')}
                rows={5}
            />
            {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}



            <div className="flex flex-col gap-2 mt-4">
                <p className="text-sm font-medium text-gray-700">{t('roles.permissions')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                    {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`permission-${permission.id}`}
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => handlePermissionChange(permission.id)}
                            />
                            <label htmlFor={`permission-${permission.id}`} className="text-sm cursor-pointer">
                                {permission.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                    {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                    {roleToEdit ? t('common.save') : t('common.create')}
                </Button>
            </div>
        </>
    );

    return (
        <div className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold">{roleToEdit ? t('roles.editRole') : t('roles.createRole')}</h2>
            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(onSubmit)}>
                {renderRoleContent()}
            </form>
        </div>
    )
}