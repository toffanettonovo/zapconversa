import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type User, type Instance } from '@/lib/data';
import { Badge } from './ui/badge';
import { Circle, Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, QuerySnapshot, DocumentData, addDoc, updateDoc, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { UserForm } from './user-form';
import { InstanceForm } from './instance-form';
import { useToast } from '@/hooks/use-toast';

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for server-side rendering
  return process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000';
}


export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInstances, setLoadingInstances] = useState(true);
  
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isInstanceFormOpen, setIsInstanceFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [selectedInstance, setSelectedInstance] = useState<Instance | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), 
      (snapshot: QuerySnapshot<DocumentData>) => {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
        setUsers(usersList);
        setLoadingUsers(false);
      }, 
      (error) => {
        console.error("Error fetching users: ", error);
        setLoadingUsers(false);
        toast({ title: "Erro ao buscar usuários", description: "Não foi possível carregar os dados dos usuários.", variant: "destructive" });
      }
    );

    const unsubscribeInstances = onSnapshot(collection(db, 'instances'), 
      (snapshot: QuerySnapshot<DocumentData>) => {
        const instancesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Instance[];
        setInstances(instancesList);
        setLoadingInstances(false);
      }, 
      (error) => {
        console.error("Error fetching instances: ", error);
        setLoadingInstances(false);
        toast({ title: "Erro ao buscar instâncias", description: "Não foi possível carregar os dados das instâncias.", variant: "destructive" });
      }
    );
    
    return () => {
      unsubscribeUsers();
      unsubscribeInstances();
    };
  }, [toast]);

  const handleSaveUser = async (userData: Omit<User, 'id'> & { id?: string; password?: string }) => {
    try {
      if (userData.id) { // Editing an existing user
        const userRef = doc(db, 'users', userData.id);
        const { id, password, ...updateData } = userData; // Don't save password field
        await updateDoc(userRef, updateData as any);
         toast({ title: "Sucesso", description: "Usuário atualizado." });
      } else { // Creating a new user
        if (!userData.password || !userData.email) {
            throw new Error("Email e senha são obrigatórios para novos usuários.");
        }
        // Step 1: Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const newAuthUser = userCredential.user;

        // Step 2: Create user document in Firestore with the UID from Auth
        const { password, ...firestoreData } = userData;
        await setDoc(doc(db, "users", newAuthUser.uid), firestoreData);
        toast({ title: "Sucesso", description: "Usuário criado com sucesso." });
      }
      setIsUserFormOpen(false);
      setSelectedUser(undefined);
    } catch (error: any) {
      console.error("Error saving user: ", error);
       toast({
        title: "Erro ao salvar usuário",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
     if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      try {
        // Note: This only deletes from Firestore, not from Firebase Auth.
        // Deleting from Auth is a protected action that typically requires a backend function.
        await deleteDoc(doc(db, 'users', userId));
        toast({ title: "Sucesso", description: "Usuário excluído do banco de dados." });
      } catch (error: any) {
        console.error("Error deleting user: ", error);
         toast({
          title: "Erro ao excluir usuário",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveInstance = async (instanceData: Omit<Instance, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity' | 'webhookUrl'> & { id?: string }) => {
    try {
      const baseUrl = getBaseUrl();
      if (instanceData.id) { // Editing
        const instanceRef = doc(db, 'instances', instanceData.id);
        const { id, ...updateData } = instanceData;
        const webhookUrl = `${baseUrl}/api/webhook/${id}`;
        await updateDoc(instanceRef, {
          ...updateData,
          webhookUrl,
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Sucesso", description: "Instância atualizada." });
      } else { // Creating
        const newDocRef = await addDoc(collection(db, 'instances'), {
          ...instanceData,
          lastActivity: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          webhookUrl: '', // Placeholder
        });
         const webhookUrl = `${baseUrl}/api/webhook/${newDocRef.id}`;
         await updateDoc(newDocRef, { webhookUrl });
        toast({ title: "Sucesso", description: "Instância criada." });
      }
      setIsInstanceFormOpen(false);
      setSelectedInstance(undefined);
    } catch (error: any) {
      console.error("Error saving instance: ", error);
      toast({
        title: "Erro ao salvar instância",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteInstance = async (instanceId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta instância?')) {
      try {
        await deleteDoc(doc(db, 'instances', instanceId));
        toast({ title: "Sucesso", description: "Instância excluída." });
      } catch (error: any) {
        console.error("Error deleting instance: ", error);
         toast({
          title: "Erro ao excluir instância",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };


  return (
    <div className="flex-1 flex flex-col bg-transparent">
       <UserForm 
        isOpen={isUserFormOpen} 
        onOpenChange={(isOpen) => {
            setIsUserFormOpen(isOpen);
            if (!isOpen) setSelectedUser(undefined);
        }}
        onSave={handleSaveUser}
        user={selectedUser}
      />
      <InstanceForm
        isOpen={isInstanceFormOpen}
        onOpenChange={(isOpen) => {
            setIsInstanceFormOpen(isOpen);
            if (!isOpen) setSelectedInstance(undefined);
        }}
        onSave={handleSaveInstance}
        instance={selectedInstance}
      />

      <header className="p-4 border-b border-[#1f2c33] bg-[#202c33]">
        <h2 className="text-xl font-semibold text-white">Painel do Administrador</h2>
      </header>
      <div className="flex-1 p-6 overflow-y-auto">
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-2 bg-[#2a3942] border border-[#1f2c33]">
            <TabsTrigger value="users" className="data-[state=active]:bg-[#111b21] data-[state=active]:text-white">Gerenciamento de Usuários</TabsTrigger>
            <TabsTrigger value="instances" className="data-[state=active]:bg-[#111b21] data-[state=active]:text-white">Gerenciamento de Instâncias</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Card className="bg-[#111b21] border-[#1f2c33]">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-white">Usuários</CardTitle>
                  <CardDescription>Crie, edite e gerencie os usuários do sistema.</CardDescription>
                </div>
                <Button variant="ghost" className="text-white hover:bg-[#2a3942] hover:text-white" onClick={() => { setSelectedUser(undefined); setIsUserFormOpen(true); }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Usuário
                </Button>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#1f2c33] hover:bg-transparent">
                      <TableHead className="text-gray-400">Nome</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Função</TableHead>
                      <TableHead className="text-gray-400">ID da Instância</TableHead>
                      <TableHead className="text-right text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? users.map((user) => (
                      <TableRow key={user.id} className="border-[#1f2c33] hover:bg-[#1f2c33]">
                        <TableCell className="font-medium text-white">{user.name}</TableCell>
                        <TableCell className="text-gray-300">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={user.role === 'admin' ? 'bg-[#00a884] text-white' : 'bg-gray-600 text-gray-200'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{user.instanceId}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={() => { setSelectedUser(user); setIsUserFormOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow className="border-[#1f2c33] hover:bg-transparent">
                        <TableCell colSpan={5} className="text-center h-24 text-gray-400">Nenhum usuário encontrado.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="instances">
            <Card className="bg-[#111b21] border-[#1f2c33]">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-white">Instâncias</CardTitle>
                  <CardDescription>Configure instâncias da Evolution API.</CardDescription>
                </div>
                 <Button variant="ghost" className="text-white hover:bg-[#2a3942] hover:text-white" onClick={() => { setSelectedInstance(undefined); setIsInstanceFormOpen(true); }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Instância
                </Button>
              </CardHeader>
              <CardContent>
                 {loadingInstances ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#1f2c33] hover:bg-transparent">
                      <TableHead className="text-gray-400">Nome</TableHead>
                      <TableHead className="text-gray-400">URL da API</TableHead>
                      <TableHead className="text-gray-400">Webhook</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-right text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instances.length > 0 ? instances.map((instance) => (
                      <TableRow key={instance.id} className="border-[#1f2c33] hover:bg-[#1f2c33]">
                        <TableCell className="font-medium text-white">{instance.name}</TableCell>
                        <TableCell className="text-gray-300">{instance.apiUrl}</TableCell>
                        <TableCell className="text-gray-300 text-xs">{instance.webhookUrl}</TableCell>
                        <TableCell>
                          <Badge variant={instance.isActive ? 'default' : 'destructive'} className={`flex items-center gap-2 w-fit ${instance.isActive ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                            <Circle className={`h-2 w-2 ${instance.isActive ? 'fill-green-400' : 'fill-red-400'}`} />
                            {instance.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={() => { setSelectedInstance(instance); setIsInstanceFormOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => handleDeleteInstance(instance.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                       <TableRow className="border-[#1f2c33] hover:bg-transparent">
                        <TableCell colSpan={5} className="text-center h-24 text-gray-400">Nenhuma instância encontrada.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
