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

export const RoleView = ({ onClose, roleToEdit }: RoleFormProps) => {
    const { t } = useTranslation();

    const renderRoleContent = () => (
        <>
            <div className="flex flex-col gap-4 w-full">
                {/*  only view name, description, hierarchy_level, permissions */}
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.name')}</p>
                    <p>{roleToEdit?.name}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.description')}</p>
                    <p>{roleToEdit?.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.hierarchy')}</p>
                    <p>{roleToEdit?.hierarchy_level}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.permissions')}</p>
                </div>
                {/* grid of permissions */}
                <div className="grid grid-cols-2 gap-2">
                    {roleToEdit?.permissions.map((permission) => (
                        <div key={permission.id} className="flex flex-col gap-2">

                            <p>{permission.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );

    return (
        <div className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold">{roleToEdit ? t('roles.editRole') : t('users.createRole')}</h2>

            {renderRoleContent()}

        </div>
    )
}