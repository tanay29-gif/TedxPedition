import "./AdminHeader.css";

export default function AdminHeader({
    adminData,
    user,
    onLogout,
}) {

    const initials =
        adminData?.name
            ?.split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase() || "A";

    return (

        <header className="admin-header">

            {/* Left Section */}

            <div className="admin-brand">

                <h1>
                    TED<span>X</span>pedition
                </h1>

                <p>Admin Control Center</p>

            </div>


            {/* Center Section */}

            <div className="admin-profile">

                <div className="admin-avatar">

                    {initials}

                    <span className="online-indicator"></span>

                </div>

                <div className="admin-information">

                    <h2>

                        {adminData?.name || user?.displayName}

                    </h2>

                    <div className="admin-role">

                        <span>

                            {adminData?.role || "Admin"}

                        </span>

                        <span className="divider">•</span>

                        <span>

                            Stall {adminData?.stallAssigned}

                        </span>

                    </div>

                    <small>

                        {user?.email}

                    </small>

                </div>

            </div>


            {/* Right Section */}

            <div className="admin-actions">

                <button
                    className="logout-button"
                    onClick={onLogout}
                >

                    Logout

                </button>

            </div>

        </header>

    );

}