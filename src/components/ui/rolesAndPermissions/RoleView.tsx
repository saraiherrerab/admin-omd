import { useTranslation } from "react-i18next";
import type { Role } from "@/types/roles";


interface RoleFormProps {
    roleToEdit?: Role | null;
}

export const RoleView = ({ roleToEdit }: RoleFormProps) => {
    const { t } = useTranslation();

    const renderRoleContent = () => (
        <>
            <div className="flex flex-col gap-4 w-full">
                {/*  only view name, description, permissions */}
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.name')}</p>
                    <p>{roleToEdit?.name}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.description')}</p>
                    <p>{roleToEdit?.description}</p>
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