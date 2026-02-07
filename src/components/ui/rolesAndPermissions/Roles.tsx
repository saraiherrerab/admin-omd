import { useTranslation } from "react-i18next"
import { Button } from "../Button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { Table } from "../Table";
import { ButtonGroup } from "../ButtonGroup";
import { Dialog } from "../Dialog";
import { RoleForm } from "./RoleForm";
import type { Role } from "@/types/roles";
import { Spinner } from "../Spinner";
import { RoleView } from "./RoleView";
import { DeletePrompt } from "../DeletePrompt";
import { TableCell } from "../TableCell";
export const Roles = () => {
    const { t } = useTranslation();
    const { roles, getRoles, loading, error, deleteRole, changeStatus } = useRoles();
    const [openDialog, setOpenDialog] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [roleToView, setRoleToView] = useState<Role | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

    useEffect(() => {
        getRoles();
    }, [getRoles]);

    const handleOpenCreate = () => {
        setRoleToEdit(null);
        setOpenDialog(true);
    };

    const handleEdit = (role: Role) => {
        setRoleToEdit(role);
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setRoleToEdit(null);
    };

    const handleDelete = (role: Role) => {
        setRoleToDelete(role);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (roleToDelete) {
            await deleteRole(roleToDelete.id);
            setOpenDeleteDialog(false);
            setRoleToDelete(null);
        }
    };

    const handleCloseDelete = () => {
        setOpenDeleteDialog(false);
        setRoleToDelete(null);
    };

    const handleView = (role: Role) => {
        setRoleToView(role);
        setOpenViewDialog(true);
    };

    const handleCloseView = () => {
        setOpenViewDialog(false);
        setRoleToView(null);
    };

    const handleChangeStatus = async (id: number, status: string) => {
        await changeStatus(id, status);
    };

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">{t('roles.title')}</h2>
                    <Button className="flex gap-2 py-4 px-6" onClick={handleOpenCreate}>
                        <Plus size={20} />
                        {t('common.labels.create')}
                    </Button>
                </div>
                <div className="flex flex-col gap-4">
                    {loading ? (
                        <Spinner />
                    ) : roles && roles.length > 0 ? (
                        <Table
                            title={t('roles.title')}
                            subtitle={t('roles.rolesList')}
                            headers={[t('common.labels.name'), t('common.labels.state'), t('common.labels.created'), t('common.labels.actions')]}
                        >
                            {roles.map((role) => (
                                <tr key={role.id} className="block md:table-row bg-card mb-4 rounded-lg shadow-sm border p-4 md:p-0 md:mb-0 md:shadow-none md:border-b md:border-border md:bg-transparent">
                                    <TableCell label={t('common.labels.name')}>{role.name}</TableCell>
                                    <TableCell label={t('common.labels.state')}>
                                        <span className={`px-2 py-1 rounded-full text-xs ${role.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {role.status}
                                        </span>
                                    </TableCell>
                                    <TableCell label={t('common.labels.created')}>{new Date(role.created_at).toLocaleDateString() || 'N/A'}</TableCell>
                                    <td className="flex justify-between     items-center md:table-cell py-2 md:py-4 md:px-4 border-b md:border-0 last:border-0">
                                        <span className="font-semibold md:hidden text-muted-foreground">{t('common.labels.actions')}</span>
                                        <div className="flex gap-2">
                                            <ButtonGroup >
                                                <Button variant="ghost" className="justify-start" onClick={() => { handleView(role) }}>{t('common.labels.view')}</Button>
                                                <Button variant="ghost" className="justify-start" onClick={() => handleEdit(role)}>{t('roles.editRole')}</Button>
                                                <Button variant="ghost" className="justify-start w-full" onClick={() => handleChangeStatus(role.id, role.status === "active" ? "inactive" : "active")}>{t('common.labels.changeStatus')}</Button>
                                                <Button variant="destructive" className="justify-start" onClick={() => handleDelete(role)}>{t('common.labels.delete')}</Button>
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
            <Dialog open={openDialog} onClose={handleClose}>
                <RoleForm onClose={handleClose} roleToEdit={roleToEdit} onSuccess={getRoles} />
            </Dialog>

            {/* Dialog only for view */}
            <Dialog open={openViewDialog} onClose={handleCloseView}>
                <RoleView onClose={handleCloseView} roleToEdit={roleToView} />
            </Dialog>

            {/* Dialog for delete confirmation */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDelete}>
                <DeletePrompt
                    title={t('roles.deleteRole')}
                    message={t('roles.confirmDeleteRole')}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCloseDelete}
                />
            </Dialog>
        </>
    )
}
