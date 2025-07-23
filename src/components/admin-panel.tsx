import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type User, type Instance } from '@/lib/data';
import { Badge } from './ui/badge';
import { Circle, Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, QuerySnapshot, DocumentData, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserForm } from './user-form';
import { InstanceForm } from './instance-form';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInstances, setLoadingInstances] = useState(true);
  
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isInstanceFormOpen, setIsInstanceFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [selectedInstance, setSelectedInstance] = useState<Instance | undefined>(undefined);

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
      }
    );
    
    return () => {
      unsubscribeUsers();
      unsubscribeInstances();
    };
  }, []);

  const handleSaveUser = async (user: Omit<User, 'id'> | User) => {
    if ('id' in user) {
      const userRef = doc(db, 'users', user.id);
      const { id, ...userData } = user;
      await updateDoc(userRef, userData);
    } else {
      await addDoc(collection(db, 'users'), user);
    }
    setIsUserFormOpen(false);
  };
  
  const handleDeleteUser = async (userId: string) => {
     if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      await deleteDoc(doc(db, 'users', userId));
    }
  };

  const handleSaveInstance = async (instance: Omit<Instance, 'id'> | Instance) => {
    if ('id' in instance) {
      const instanceRef = doc(db, 'instances', instance.id);
       const { id, ...instanceData } = instance;
      await updateDoc(instanceRef, instanceData);
    } else {
      await addDoc(collection(db, 'instances'), instance);
    }
    setIsInstanceFormOpen(false);
  };
  
  const handleDeleteInstance = async (instanceId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta instância?')) {
      await deleteDoc(doc(db, 'instances', instanceId));
    }
  };


  return (
    <div className="flex-1 flex flex-col bg-transparent">
       <UserForm 
        isOpen={isUserFormOpen} 
        onOpenChange={setIsUserFormOpen}
        onSave={handleSaveUser}
        user={selectedUser}
      />
      <InstanceForm
        isOpen={isInstanceFormOpen}
        onOpenChange={setIsInstanceFormOpen}
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
                    <TableRow className="border-[#1f2c33]">
                      <TableHead className="text-gray-400">Nome</TableHead>
                      <TableHead className="text-gray-400">Função</TableHead>
                      <TableHead className="text-gray-400">Instância</TableHead>
                      <TableHead className="text-right text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? users.map((user) => (
                      <TableRow key={user.id} className="border-[#1f2c33]">
                        <TableCell className="font-medium text-white">{user.name}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={user.role === 'admin' ? 'bg-[#00a884] text-white' : 'bg-gray-600 text-gray-200'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{user.instance}</TableCell>
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
                      <TableRow className="border-[#1f2c33]">
                        <TableCell colSpan={4} className="text-center h-24 text-gray-400">Nenhum usuário encontrado.</TableCell>
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
                    <TableRow className="border-[#1f2c33]">
                      <TableHead className="text-gray-400">Nome</TableHead>
                      <TableHead className="text-gray-400">URL da API</TableHead>
                      <TableHead className="text-gray-400">Webhook</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-right text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instances.length > 0 ? instances.map((instance) => (
                      <TableRow key={instance.id} className="border-[#1f2c33]">
                        <TableCell className="font-medium text-white">{instance.name}</TableCell>
                        <TableCell className="text-gray-300">{instance.apiUrl}</TableCell>
                        <TableCell className="text-gray-300">{instance.webhook}</TableCell>
                        <TableCell>
                          <Badge variant={instance.status === 'connected' ? 'default' : 'destructive'} className={`flex items-center gap-2 w-fit ${instance.status === 'connected' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                            <Circle className={`h-2 w-2 ${instance.status === 'connected' ? 'fill-green-400' : 'fill-red-400'}`} />
                            {instance.status === 'connected' ? 'Conectado' : 'Desconectado'}
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
                       <TableRow className="border-[#1f2c33]">
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
