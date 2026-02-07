import { Select } from "../Select";
import { useRoles } from "@/hooks/useRoles";
import { useUsers } from "@/hooks/useUsers"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { Button } from "../Button";
import { Spinner } from "../Spinner";

interface AssignRolesFormProps {
    userId: number;
    onClose: () => void;
}

export const AssignRolesForm = ({ userId, onClose }: AssignRolesFormProps) => {
    const { t } = useTranslation();
    const { user, getUser, assignRole } = useUsers();
    const { roles, getRoles } = useRoles();
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

    useEffect(() => {
        getUser(userId)
    }, [getUser])

    useEffect(() => {
        getRoles()
    }, [getRoles])

    // get all the roles of the user
    useEffect(() => {
        if (user) {
            setSelectedRoles(user.roleDetails.map(r => r.id));
            console.log("User roles", user.roleDetails);
        }
    }, [user])

    const handleAssign = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Assigning role", selectedRoles, "to user", userId);
        assignRole(userId, selectedRoles);
        onClose();
    }

    const handleRoleChange = (roleId: number) => {
        setSelectedRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    }

    return (
        <div className="p-4 flex flex-col gap-6 h-full">
            <p className="text-xl font-bold">
                {t('common.labels.assign')}</p>

            {user ? <form className="flex flex-col gap-6 w-full h-full" onSubmit={handleAssign} >
                <p> {user.name} {user.lastname}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto ">
                    {roles.map((role) => (
                        <div key={role.id} className="flex items-center gap-2">

                            <input
                                type="checkbox"
                                id={`role-${role.id}`}
                                checked={selectedRoles.includes(role.id)}
                                onChange={() => handleRoleChange(role.id)}
                            />
                            <label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer">
                                {role.name}
                            </label>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-4">
                    <Button
                        type="submit"
                        disabled={!selectedRoles}
                    >
                        {t('common.labels.assign')}
                    </Button>
                </div>
            </form>
                : <Spinner />
            }
        </div>
    )
}