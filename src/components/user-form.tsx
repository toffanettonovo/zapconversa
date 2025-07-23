// src/components/user-form.tsx
'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { type User, type Instance } from '@/lib/data';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('O e-mail é inválido.'),
  password: z.string().optional(),
  role: z.enum(['admin', 'user']),
  instanceIds: z.array(z.string()),
}).refine((data) => {
    if (data.role === 'user' && data.instanceIds.length === 0) {
        return false;
    }
    return true;
}, {
    message: "Você precisa selecionar pelo menos uma instância para usuários.",
    path: ["instanceIds"],
});


type UserFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: any) => void;
  user?: User;
  instances: Instance[];
};

export function UserForm({ isOpen, onOpenChange, onSave, user, instances }: UserFormProps) {
  const isEditing = !!user;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: user ? { ...user, instanceIds: user.instanceIds || [] } : {
      name: '',
      email: '',
      password: '',
      role: 'user',
      instanceIds: [],
    },
  });

  const role = useWatch({
    control: form.control,
    name: "role",
  });
  
  useEffect(() => {
    const defaultValues = user ? { ...user, password: '', instanceIds: user.instanceIds || [] } : {
        name: '',
        email: '',
        password: '',
        role: 'user',
        instanceIds: [],
      };
    form.reset(defaultValues);
  }, [user, form, isOpen]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!isEditing && !values.password) {
        form.setError("password", { type: "manual", message: "A senha é obrigatória para novos usuários." });
        return;
    }
    
    const dataToSave = { ...values };
    if (dataToSave.role === 'admin') {
      dataToSave.instanceIds = []; // Admins have implicit access to all
    }

    onSave(user ? { ...user, ...dataToSave } : dataToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111b21] border-[#1f2c33] text-white">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Criar Usuário'}</DialogTitle>
          <DialogDescription>
             {user ? 'Edite os detalhes do usuário.' : 'Preencha os detalhes do novo usuário.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name">Nome</Label>
                   <FormControl>
                        <Input id="name" {...field} className="bg-[#2a3942] border-none" />
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="email">Email</Label>
                   <FormControl>
                        <Input id="email" type="email" {...field} className="bg-[#2a3942] border-none" disabled={isEditing} />
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEditing && (
                 <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="password">Senha</Label>
                       <FormControl>
                            <Input id="password" type="password" {...field} className="bg-[#2a3942] border-none" />
                       </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                        <Label>Função</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-[#2a3942] border-none">
                                    <SelectValue placeholder="Selecione a função" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#111b21] border-[#1f2c33] text-white">
                                <SelectItem value="admin" className="hover:!bg-[#2a3942]">Admin</SelectItem>
                                <SelectItem value="user" className="hover:!bg-[#2a3942]">User</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {role === 'user' && (
              <FormField
                  control={form.control}
                  name="instanceIds"
                  render={() => (
                      <FormItem>
                      <div className="mb-4">
                          <FormLabel className="text-base">Instâncias Associadas</FormLabel>
                          <p className="text-sm text-muted-foreground">
                          Selecione as instâncias que este usuário terá acesso.
                          </p>
                      </div>
                      <ScrollArea className="h-32 w-full rounded-md border border-[#2a3942] p-4">
                      {instances.map((instance) => (
                          <FormField
                          key={instance.id}
                          control={form.control}
                          name="instanceIds"
                          render={({ field }) => {
                              return (
                              <FormItem
                                  key={instance.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                              >
                                  <FormControl>
                                  <Checkbox
                                      checked={field.value?.includes(instance.id)}
                                      onCheckedChange={(checked) => {
                                      return checked
                                          ? field.onChange([...(field.value || []), instance.id])
                                          : field.onChange(
                                              field.value?.filter(
                                              (value) => value !== instance.id
                                              )
                                          );
                                      }}
                                  />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                  {instance.name}
                                  </FormLabel>
                              </FormItem>
                              );
                          }}
                          />
                      ))}
                      </ScrollArea>
                      <FormMessage />
                      </FormItem>
                  )}
              />
            )}
             <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" className="hover:bg-[#2a3942]" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[#00a884] hover:bg-[#008f71]">Salvar</Button>
            </div>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
