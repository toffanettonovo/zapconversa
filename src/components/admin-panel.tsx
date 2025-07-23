import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type User, type Instance } from '@/lib/data';
import { Badge } from './ui/badge';
import { Circle, Loader2, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
        setUsers(usersList);

        const instancesCollection = collection(db, 'instances');
        const instancesSnapshot = await getDocs(instancesCollection);
        const instancesList = instancesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Instance[];
        setInstances(instancesList);

      } catch (error) {
        console.error("Error fetching data: ", error);
        // Here you could show a toast message to the user
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-secondary/30">
      <header className="p-4 border-b border-border bg-card">
        <h2 className="text-xl font-semibold">Painel do Administrador</h2>
      </header>
      <div className="flex-1 p-6 overflow-y-auto">
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Gerenciamento de Usuários</TabsTrigger>
            <TabsTrigger value="instances">Gerenciamento de Instâncias</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Usuários</CardTitle>
                  <CardDescription>Crie, edite e gerencie os usuários do sistema.</CardDescription>
                </div>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Usuário
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Instância</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.instance}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Editar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="instances">
            <Card>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Instâncias</CardTitle>
                  <CardDescription>Configure instâncias da Evolution API.</CardDescription>
                </div>
                 <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Instância
                </Button>
              </CardHeader>
              <CardContent>
                 {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>URL da API</TableHead>
                      <TableHead>Webhook</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instances.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell className="font-medium">{instance.name}</TableCell>
                        <TableCell>{instance.apiUrl}</TableCell>
                        <TableCell>{instance.webhook}</TableCell>
                        <TableCell>
                          <Badge variant={instance.status === 'connected' ? 'default' : 'destructive'} className="flex items-center gap-2 w-fit">
                            <Circle className={`h-2 w-2 ${instance.status === 'connected' ? 'fill-green-400' : 'fill-red-400'}`} />
                            {instance.status === 'connected' ? 'Conectado' : 'Desconectado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Editar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
