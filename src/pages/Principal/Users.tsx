import { Layout } from "@/components/Layout"
import { useTranslation } from "react-i18next"
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@/types/users";
import { useUsers } from "@/hooks/useUsers";

import { useRoles } from "@/hooks/useRoles";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";



export const Users = () => {
    const { t } = useTranslation();
    const { users, getUsers, loading, error, pagination } = useUsers();

    const { getRoles, roles } = useRoles();
    const [openDialog, setOpenDialog] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const PAGE_LIMIT = 5;
    const [filters, setFilters] = useState({
        name: '',
        balance: '',
        role: '',
        includeRoles: true,
        includePermissions: true,
        page: 1,
        limit: PAGE_LIMIT
    });

    const updateFilter = (filter: string, value: any) => {
        setFilters(prev => ({ ...prev, [filter]: value, page: 1 }));
    };

    useEffect(() => {
        getUsers(filters);
    }, [getUsers, filters]);

    useEffect(() => {
        getRoles();
    }, [getRoles]);

    const handleOpenCreate = () => {
        setUserToEdit(null);
        setOpenDialog(true);
    };

    const handleEdit = (user: User) => {
        setUserToEdit(user);
        setOpenDialog(true);
    };

    return (
        <Layout>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">{t('users.title')}</h1>
                        <p className="text-muted-foreground">{t('users.subtitle')}</p>
                    </div>
                    <Button className="flex gap-2 py-4 px-6" onClick={handleOpenCreate}>
                        <Plus size={20} />
                        {t('users.createUser')}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-card p-4 rounded-lg border">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">{t('common.labels.name')}</label>
                        <Input
                            placeholder={t('common.placeholders.searchByName')}
                            value={filters.name}
                            onChange={(e) => updateFilter('name', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">{t('common.labels.balance')}</label>
                        <Input
                            type="number"
                            placeholder={t('common.placeholders.balance')}
                            value={filters.balance}
                            onChange={(e) => updateFilter('balance', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">{t('common.labels.role')}</label>
                        <Select
                            value={filters.role}
                            onChange={(e) => updateFilter('role', e.target.value)}
                            options={[
                                { value: '', label: t('common.labels.allRoles') },
                                ...roles.map(r => ({ value: r.id.toString(), label: r.name }))
                            ]}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setFilters({
                                name: '',
                                balance: '',
                                role: '',
                                includeRoles: true,
                                includePermissions: true,
                                page: 1,
                                limit: PAGE_LIMIT
                            })}
                        >
                            {t('common.actions.clearFilters')}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {loading ? (
                        <p>{t('common.loading')}</p>
                    ) : users && users.length > 0 ? (
                        <Table
                            headers={[t('common.labels.name'), t('common.labels.email'), t('common.labels.role'), t('common.labels.state'), t('common.labels.actions')]}
                        >
                            {users.map((user: User) => (
                                <tr key={user.id} className="block md:table-row bg-card mb-4 rounded-lg shadow-sm border p-4 md:p-0 md:mb-0 md:shadow-none md:border-b md:border-border md:bg-transparent">
                                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('common.labels.name')}</span>
                                        {user.name}
                                    </td>

                                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('common.labels.email')}</span>
                                        {user.email}
                                    </td>

                                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('common.labels.role')}</span>
                                        {user.roles.map((role: any) => role.name).join(', ')}
                                    </td>

                                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('common.labels.state')}</span>
                                        <Chip label={user.status} variant={user.status === 'active' ? 'default' : 'destructive'} />
                                    </td>

                                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('common.labels.actions')}</span>
                                        <div className="flex gap-2">
                                            <ButtonGroup>
                                                <Button variant="ghost" className="justify-start" onClick={() => handleEdit(user)}>{t('common.labels.edit')}</Button>
                                            </ButtonGroup>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    ) : (
                        <p className="text-center py-8 text-muted-foreground">{error || t('users.noRolesFound')}</p>
                    )}

                    <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-muted-foreground">
                            {t('common.pagination.page')} {filters.page} {pagination?.pages ? `of ${pagination.pages}` : ''}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={filters.page === 1}
                                onClick={() => updateFilter('page', filters.page - 1)}
                            >
                                {t('common.pagination.previous')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination?.pages ? filters.page >= pagination.pages : false}
                                onClick={() => updateFilter('page', filters.page + 1)}
                            >
                                {t('common.pagination.next')}
                            </Button>
                        </div>
                    </div>
                </div>


            </div>
        </Layout>
    )
}