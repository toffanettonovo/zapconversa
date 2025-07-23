import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type User, type Instance, NGROK_URL as FALLBACK_NGROK_URL } from '@/lib/data';
import { Badge } from './ui/badge';
import { Circle, Loader2, PlusCircle, Trash2, Edit, Copy, Send, Server, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, QuerySnapshot, DocumentData, addDoc, updateDoc, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { UserForm } from './user-form';
import { InstanceForm } from './instance-form';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import WebhookLogs from './webhook-logs';
import { testWebhookAction, updateProfilePicturesAction } from '@/lib/actions';
import { Label } from './ui/label';
import { Input } from './ui/input';

const NGROK_STORAGE_KEY = 'ngrok_base_url';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [isTestingWebhook, setIsTestingWebhook] = useState<string | null>(null);
  const [isSyncingPhotos, setIsSyncingPhotos] = useState(false);

  const [ngrokUrl, setNgrokUrl] = useState('');
  
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isInstanceFormOpen, setIsInstanceFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'instance' | 'user'} | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [selectedInstance, setSelectedInstance] = useState<Instance | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    // Load ngrok URL from localStorage on initial render
    const storedUrl = localStorage.getItem(NGROK_STORAGE_KEY);
    setNgrokUrl(storedUrl || FALLBACK_NGROK_URL);
  
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
  
  const handleNgrokUrlChange = (newUrl: string) => {
    setNgrokUrl(newUrl);
    localStorage.setItem(NGROK_STORAGE_KEY, newUrl);
  };
  
  const handleTestWebhook = async (instanceId: string) => {
    if (!ngrokUrl) {
        toast({ title: 'Erro', description: 'Por favor, insira a URL do ngrok antes de testar.', variant: 'destructive' });
        return;
    }

    const instance = instances.find(inst => inst.id === instanceId);
    if (!instance) {
        toast({ title: 'Erro', description: 'Instância não encontrada.', variant: 'destructive' });
        return;
    }
    
    setIsTestingWebhook(instanceId);

    try {
        const result = await testWebhookAction(instanceId, instance.name, ngrokUrl);
        
        if (result.success) {
            toast({
                title: 'Teste de Webhook Enviado',
                description: `Webhook enviado com sucesso. Resposta: ${result.message}`,
            });
        } else {
            throw new Error(result.error);
        }

    } catch (error: any) {
        console.error(error);
        toast({
            title: 'Erro ao Testar Webhook',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsTestingWebhook(null);
    }
  };


  const handleSaveUser = async (userData: Omit<User, 'id'> & { id?: string; password?: string }) => {
    try {
      const { id, password, ...firestoreData } = userData;

      // Scenario 1: Editing an existing user (ID will be the original user.id)
      if (isUserFormOpen && selectedUser) {
        const userRef = doc(db, 'users', selectedUser.id);
        await updateDoc(userRef, firestoreData as any);
        toast({ title: "Sucesso", description: "Usuário atualizado." });
      } 
      // Scenario 2: Creating a profile for an existing Auth user (ID is provided in the form)
      else if (id) {
         await setDoc(doc(db, "users", id), firestoreData);
         toast({ title: "Sucesso", description: "Perfil de usuário criado com sucesso." });
      }
      // Scenario 3: Creating a new user from scratch
      else {
        if (!password || !userData.email) {
            throw new Error("Email e senha são obrigatórios para novos usuários.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
        const newAuthUser = userCredential.user;
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
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const { id, type } = itemToDelete;

    try {
      if (type === 'instance') {
        await deleteDoc(doc(db, 'instances', id));
        toast({ title: "Sucesso", description: "Instância excluída." });
      } else if (type === 'user') {
        // Note: This only deletes from Firestore. The user still exists in Firebase Auth.
        // A more complete solution would involve a Cloud Function to delete the user from Auth.
        await deleteDoc(doc(db, 'users', id));
        toast({ title: "Sucesso", description: "Usuário excluído do banco de dados." });
      }
    } catch (error: any) {
       toast({
        title: `Erro ao excluir ${type === 'instance' ? 'instância' : 'usuário'}`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (id: string, type: 'instance' | 'user') => {
    setItemToDelete({ id, type });
    setIsDeleteDialogOpen(true);
  };

  const handleSaveInstance = async (instanceData: Omit<Instance, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity' | 'webhookUrl'> & { id?: string }) => {
    try {
      if (instanceData.id) { // Editing
        const instanceRef = doc(db, 'instances', instanceData.id);
        const { id, ...updateData } = instanceData;
        await updateDoc(instanceRef, {
          ...updateData,
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Sucesso", description: "Instância atualizada." });
      } else { // Creating
        await addDoc(collection(db, 'instances'), {
          ...instanceData,
          lastActivity: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
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
  
  const handleCopyWebhook = (id: string) => {
    if (ngrokUrl) {
      const finalUrl = `${ngrokUrl}/api/webhook/${id}`;
      navigator.clipboard.writeText(finalUrl);
      toast({ title: 'Copiado!', description: 'URL final do Webhook copiada para a área de transferência.' });
    } else {
       toast({ title: 'Erro', description: 'Por favor, insira a URL do ngrok antes de copiar.', variant: 'destructive' });
    }
  };

  const handleSyncPhotos = async () => {
    setIsSyncingPhotos(true);
    toast({
        title: 'Sincronização Iniciada',
        description: 'Buscando fotos de perfil para contatos existentes. Isso pode levar alguns minutos...',
    });
    try {
        const result = await updateProfilePicturesAction();
        toast({
            title: 'Sincronização Concluída',
            description: result.message,
        });
    } catch (error: any) {
        toast({
            title: 'Erro na Sincronização',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsSyncingPhotos(false);
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
        instances={instances}
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o item.
                 {itemToDelete?.type === 'user' && " A exclusão do usuário remove apenas o perfil do banco de dados, não a autenticação do Firebase."}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>


      <header className="p-4 border-b border-[#1f2c33] bg-[#202c33]">
        <h2 className="text-xl font-semibold text-white">Painel do Administrador</h2>
      </header>
      <div className="flex-1 p-6 overflow-y-auto">
        <Tabs defaultValue="instances">
          <TabsList className="grid w-full grid-cols-3 bg-[#2a3942] border border-[#1f2c33]">
            <TabsTrigger value="users" className="data-[state=active]:bg-[#111b21] data-[state=active]:text-white">Gerenciamento de Usuários</TabsTrigger>
            <TabsTrigger value="instances" className="data-[state=active]:bg-[#111b21] data-[state=active]:text-white">Gerenciamento de Instâncias</TabsTrigger>
            <TabsTrigger value="webhook-logs" className="data-[state=active]:bg-[#111b21] data-[state=active]:text-white">Logs do Webhook</TabsTrigger>
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
                      <TableHead className="text-gray-400">Instâncias</TableHead>
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
                        <TableCell className="text-gray-300">{user.instanceIds?.join(', ')}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={() => { setSelectedUser(user); setIsUserFormOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => openDeleteDialog(user.id, 'user')}>
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
                <div className="mb-6 p-4 rounded-lg border border-[#2a3942] bg-[#202c33] space-y-4">
                  <div>
                      <Label htmlFor="ngrok-url" className="flex items-center gap-2 text-base font-semibold text-white">
                          <Server className="h-5 w-5 text-gray-400" />
                          URL Base do ngrok (Persistente)
                      </Label>
                      <p className="text-sm text-gray-400 mt-1">Cole a URL gerada pelo ngrok aqui. Ela será usada para construir o webhook de todas as instâncias e será salva no seu navegador.</p>
                      <Input 
                          id="ngrok-url"
                          value={ngrokUrl}
                          onChange={(e) => handleNgrokUrlChange(e.target.value)}
                          placeholder="Ex: https://abcdef123.ngrok-free.app"
                          className="bg-[#2a3942] border-none mt-2"
                      />
                  </div>
                  <div>
                       <Label className="flex items-center gap-2 text-base font-semibold text-white">
                          <RefreshCw className="h-5 w-5 text-gray-400" />
                          Manutenção de Dados
                      </Label>
                      <p className="text-sm text-gray-400 mt-1">Execute tarefas de manutenção para manter os dados atualizados.</p>
                      <Button onClick={handleSyncPhotos} disabled={isSyncingPhotos} variant="secondary" className="mt-2 bg-[#2a3942] hover:bg-[#2f404b]">
                          {isSyncingPhotos ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                          Sincronizar Fotos de Perfil
                      </Button>
                  </div>
                </div>
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
                      <TableHead className="text-gray-400">Webhook (ngrok)</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-right text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instances.length > 0 ? instances.map((instance) => (
                      <TableRow key={instance.id} className="border-[#1f2c33] hover:bg-[#1f2c33]">
                        <TableCell className="font-medium text-white">{instance.name}</TableCell>
                        <TableCell className="text-gray-300">{instance.apiUrl}</TableCell>
                        <TableCell className="text-gray-300 text-xs">
                          <div className="flex items-center gap-2">
                             <span>{ngrokUrl ? `${ngrokUrl}/api/webhook/${instance.id}` : '...'}</span>
                             <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => handleCopyWebhook(instance.id)}>
                                <Copy className="h-3 w-3" />
                             </Button>
                          </div>
                        </TableCell>
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
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-500" onClick={() => handleTestWebhook(instance.id)} disabled={isTestingWebhook === instance.id}>
                             {isTestingWebhook === instance.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => openDeleteDialog(instance.id, 'instance')}>
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
           <TabsContent value="webhook-logs">
            <WebhookLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
