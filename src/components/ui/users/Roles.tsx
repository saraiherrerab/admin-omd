import { useTranslation } from "react-i18next"
import { Button } from "../Button";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useRoles } from "@/hooks/useRoles";
import { Table } from "../Table";
export const Roles = () => {
    const { t } = useTranslation();
    const { roles, getRoles, loading, error } = useRoles();
    useEffect(() => {
        getRoles();
    }, []);
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-6">
                <h2>{t('users.roleManagement')}</h2>
                <Button className="flex gap-2 py-4 px-6">
                    <Plus />
                    {t('users.createRole')}</Button>
            </div>
            <div className="flex flex-col gap-4">
                {roles && roles.length > 0 ? (
                    <Table
                        title={t('users.roles')}
                        subtitle={t('users.rolesList')}
                        headers={[t('users.labels.name'), t('users.labels.hierarchy'), t('users.labels.state'), t('users.labels.created'), t('users.labels.actions')]}
                        rows={roles}
                    />
                ) : (
                    <p>{error}</p>
                )}
            </div>
        </div>
    )
}