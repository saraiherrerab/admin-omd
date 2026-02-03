import { useTranslation } from "react-i18next"
import { Button } from "../Button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { Table } from "../Table";
import { ButtonGroup } from "../ButtonGroup";
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

                    >
                        {roles.map((role) => (
                            <tr key={role.id} className="block md:table-row bg-card mb-4 rounded-lg shadow-sm border p-4 md:p-0 md:mb-0 md:shadow-none md:border-b md:border-0 md:bg-transparent">
                                <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                    <span className="font-semibold md:hidden text-muted-foreground">{t('users.labels.name')}</span>
                                    {role.name}
                                </td>
                                <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                    <span className="font-semibold md:hidden text-muted-foreground">{t('users.labels.hierarchy')}</span>
                                    {role.description}
                                </td>
                                <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                    <span className="font-semibold md:hidden text-muted-foreground">{t('users.labels.state')}</span>
                                    {role.permissions.length}
                                </td>
                                <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                    <span className="font-semibold md:hidden text-muted-foreground">{t('users.labels.created')}</span>
                                    role.created_at
                                </td>
                                <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                    <span className="font-semibold md:hidden text-muted-foreground">{t('users.labels.actions')}</span>
                                    <div className="flex gap-2">
                                        <ButtonGroup>
                                            <Button variant="ghost" className="justify-start">{t('users.labels.edit')}</Button>
                                            <Button variant="destructive" className="justify-start">{t('users.labels.delete')}</Button>
                                        </ButtonGroup>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                ) : (
                    <p>{error}</p>
                )}
            </div>
        </div>
    )
}