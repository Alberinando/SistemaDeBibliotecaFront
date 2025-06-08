import LoginPage from "@/app/login/page";
import {useAuth} from "@/resources/users/authentication.resourse";
import ListaLivros from "@/app/livros/page";

export default function Home() {
  const auth = useAuth();
  const user = auth.getUserSession();

  if(!user){
    return <LoginPage/>
  }
  return (
      <ListaLivros />
  );
}
