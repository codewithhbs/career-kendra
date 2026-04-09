 export const getUserRole = () => {
    let roleData = localStorage.getItem("empl_role");

    if (roleData) {
      try {
        const parsed = JSON.parse(roleData);
        if (parsed?.roleName) return parsed.roleName;
      } catch {
      }
    }

    const adptRole = localStorage.getItem("adpt_role");
    if (adptRole) return adptRole;

    return "General HR";
  };