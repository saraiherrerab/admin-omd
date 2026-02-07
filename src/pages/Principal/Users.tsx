import { Layout } from "@/components/Layout"
import { useTranslation } from "react-i18next"
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
import { Pagination } from "@/components/ui/Pagination";
import { Dialog } from "@/components/ui/Dialog";
import { UserView } from "@/components/ui/users/UserView";
import { AssignRolesForm } from "@/components/ui/users/AssignRolesForm";
import { TableCell } from "@/components/ui/TableCell";



export const Users = () => {
    const { t } = useTranslation();
    const { users, getUsers, loading, error, pagination, getUser } = useUsers();

    const { getRoles, roles } = useRoles();
    const [openDialog, setOpenDialog] = useState(false);
    const [openAssignRolesDialog, setOpenAssignRolesDialog] = useState(false);
    const [userToView, setUserToView] = useState<number | null>(null);
    const [userToAssignRoles, setUserToAssignRoles] = useState<number | null>(null);

    /**
     * Individual filters
     */
    const [balanceFilter, setBalanceFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    /*
    * Pagination
    */
    const [currentPage, setCurrentPage] = useState(1);

    const PAGE_LIMIT = 10;




    useEffect(() => {
        getUsers({
            includeRoles: false,
            page: currentPage,
            limit: PAGE_LIMIT,
            balance: balanceFilter,
            role: roleFilter
        });
    }, [getUsers, currentPage, balanceFilter, roleFilter]);

    useEffect(() => {
        getRoles();
    }, [getRoles]);

    const handleAssignRoles = (userId: number) => {
        setUserToAssignRoles(userId);
        setOpenAssignRolesDialog(true);
    };

    const handleView = (user: User) => {
        setUserToView(user.id);
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

                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-card p-4 rounded-lg border">
                    {/* <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">{t('common.labels.name')}</label>
                        <Input
                            placeholder={t('common.placeholders.searchByName')}
                            value={filters.name}
                            onChange={(e) => updateFilter('name', e.target.value)}
                        />
                    </div> */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">{t('common.labels.balance')}</label>
                        <Input
                            type="number"
                            placeholder={t('common.placeholders.balance')}
                            value={balanceFilter}
                            onChange={(e) => setBalanceFilter(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">{t('common.labels.role')}</label>
                        <Select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
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
                            onClick={() => {
                                setBalanceFilter('');
                                setRoleFilter('');
                                setCurrentPage(1);
                            }}
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
                            headers={[t('common.labels.name'), t('common.labels.email'), t('common.labels.state'), t('common.labels.actions')]}
                        >
                            {users.map((user: User) => (
                                <tr key={user.id} className="block md:table-row bg-card mb-4 rounded-lg shadow-sm border p-4 md:p-0 md:mb-0 md:shadow-none md:border-b md:border-border md:bg-transparent">
                                    <TableCell label={t('common.labels.name')}>{user.name} {user.lastname}</TableCell>

                                    <TableCell label={t('common.labels.email')}>{user.email}</TableCell>


                                    <TableCell label={t('common.labels.state')}>
                                        <Chip label={user.status} variant={user.status === 'active' ? 'default' : 'destructive'} />
                                    </TableCell>

                                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('common.labels.actions')}</span>
                                        <div className="flex gap-2">
                                            <ButtonGroup>
                                                <Button variant="ghost" className="justify-start" onClick={() => handleView(user)}>{t('common.labels.view')}</Button>
                                                <Button variant="ghost" className="flex gap-2 py-4 px-6" onClick={() => handleAssignRoles(user.id)}>
                                                    {t('common.labels.assign')}
                                                </Button>
                                            </ButtonGroup>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    ) : (
                        <p className="text-center py-8 text-muted-foreground">{error || t('users.noUsersFound')}</p>
                    )}

                    <Pagination
                        currentPage={currentPage}
                        pagination={pagination}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} >

                    <UserView userToView={userToView} />

                </Dialog>

                <Dialog open={openAssignRolesDialog} onClose={() => setOpenAssignRolesDialog(false)} >
                    <AssignRolesForm userId={userToAssignRoles!} onClose={() => setOpenAssignRolesDialog(false)} />
                </Dialog>

            </div>
        </Layout>
    )
}