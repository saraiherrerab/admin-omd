import { useTranslation } from "react-i18next"
import { Button } from "../Button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Table } from "../Table";
import { ButtonGroup } from "../ButtonGroup";
// import { Dialog } from "../Dialog";
import type { User } from "@/types/users";
import { useUsers } from "@/hooks/useUsers";
import { Chip } from "../Chip";
import { useRoles } from "@/hooks/useRoles";
export const UsersTab = () => {
    const { t } = useTranslation();
    const { users, getUsers, loading, error, deleteUser } = useUsers();

    const { getRoles, roles } = useRoles();
    const [openDialog, setOpenDialog] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const PAGE_LIMIT = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    /**
     * Filters
     */
    const [includeRoles, setIncludeRoles] = useState(true);
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [role, setRole] = useState('');



    const [searchQuery, setSearchQuery] = useState('');



    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);





    // handle filters
    const handleFilter = (filter: string, value: string | number | boolean) => {
        // getUsers with filters
        getUsers({ [filter]: value });
    };

    useEffect(() => {
        getUsers();
    }, [getUsers]);

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


    const handleDelete = async (user: User) => {
        if (window.confirm(t('users.confirmDeleteUser'))) {
            await deleteUser(user.id);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-6">

                    <Button className="flex gap-2 py-4 px-6" onClick={handleOpenCreate}>
                        <Plus size={20} />
                        {t('users.createUser')}
                    </Button>
                </div>
                <div className="flex flex-col gap-4">
                    {loading ? (
                        <p>{t('common.loading')}</p>
                    ) : users && users.length > 0 ? (
                        <Table
                            title={t('users.users')}
                            subtitle={t('users.usersList')}
                            headers={[t('users.labels.name'), t('users.labels.email'), t('users.labels.role'), t('users.labels.state'), t('users.labels.actions')]}
                        >
                            {users.map((user) => (
                                <tr key={user.id} className="block md:table-row bg-card mb-4 rounded-lg shadow-sm border p-4 md:p-0 md:mb-0 md:shadow-none md:border-b md:border-border md:bg-transparent">
                                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('users.labels.name')}</span>
                                        {user.name}
                                    </td>

                                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('users.labels.email')}</span>
                                        {user.email}
                                    </td>

                                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('users.labels.role')}</span>
                                        {user.roles.map(role => role.name).join(', ')}
                                    </td>

                                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('users.labels.state')}</span>
                                        <Chip label={user.status} variant={user.status === 'active' ? 'default' : 'destructive'} />
                                    </td>

                                    <td className="flex justify-between items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('users.labels.actions')}</span>
                                        <div className="flex gap-2">
                                            <ButtonGroup>
                                                <Button variant="ghost" className="justify-start" onClick={() => handleEdit(user)}>{t('users.labels.edit')}</Button>
                                                <Button variant="destructive" className="justify-start" onClick={() => handleDelete(user)}>{t('users.labels.delete')}</Button>
                                            </ButtonGroup>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    ) : (
                        <p className="text-center py-8 text-muted-foreground">{error || t('users.noRolesFound')}</p>
                    )}
                </div>
            </div>

        </>
    )
}
