import { useTranslation } from "react-i18next";
import type { User } from "@/types/users";
import { useUsers } from "@/hooks/useUsers";
import { useEffect } from "react";
import { Spinner } from "../Spinner";
import { Chip } from "../Chip";



interface UserViewProps {
    userToView: number | null;
}

export const UserView = ({ userToView }: UserViewProps) => {
    const { t } = useTranslation();
    const { getUser, user } = useUsers();

    useEffect(() => {
        if (userToView) {
            getUser(userToView);
        }
    }, [userToView]);

    useEffect(() => {
        console.log(user);
    }, [user]);

    const renderUserContent = () => {
        if (!userToView) return <p className="text-muted-foreground">{t('common.loading')}</p>;

        return (
            <div className="flex flex-col gap-4 w-full overflow-y-auto h-[calc(100vh-200px)]">
                {/* show all user data */}
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.name')}</p>
                    <p>{user?.name} {user?.lastname}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.email')}</p>
                    <p>{user?.email}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.username')}</p>
                    <p>{user?.username}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.phone')}</p>
                    <p>{user?.phone}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.status')}</p>
                    <p><Chip variant={user?.status === 'active' ? 'default' : 'destructive'} label={user?.status!} /></p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.balance')}</p>
                    <p>{user?.balance}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.roles')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {user && user.roleDetails && user.roleDetails.map((role) => (
                            <Chip variant="outline" key={role.id} label={role.name} />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.createdAt')}</p>
                    <p>{user?.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{t('common.labels.updatedAt')}</p>
                    <p>{user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : '-'}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <h2 className="text-xl font-bold">
                {t('users.viewUser')}
            </h2>
            {user ? (
                renderUserContent()
            ) : (
                <Spinner />
            )}

        </div>
    )
}