import { getCategories } from "@/actions/get-categories";
import { Header } from "@/components/common/header";
import ProfileShell from "./components/shell";

const ProfilePage = async () => {
  const categories = await getCategories();

  const user = { name: "Usuário Exemplo", email: "user@example.com" };

  return (
    <>
      <Header categories={categories} />
      <ProfileShell user={user} />
    </>
  );
};

export default ProfilePage;
