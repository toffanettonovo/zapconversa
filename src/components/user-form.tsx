// src/components/user-form.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { type User } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('O e-mail é inválido.'),
  password: z.string().optional(),
  role: z.enum(['admin', 'user']),
  instanceId: z.string().min(1, 'O ID da instância é obrigatório.'),
}).refine(data => {
    // Se não há 'id' (ou seja, é um novo usuário), a senha é obrigatória.
    // Esta lógica é uma aproximação. A verificação real se o usuário é novo ou não
    // será feita fora do formulário, com base na prop 'user'.
    return true; 
}, {});


type UserFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: any) => void;
  user?: User;
};

export function UserForm({ isOpen, onOpenChange, onSave, user }: UserFormProps) {
  const isEditing = !!user;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: user || {
      name: '',
      email: '',
      password: '',
      role: 'user',
      instanceId: '',
    },
  });
  
  useEffect(() => {
    form.reset(user || {
        name: '',
        email: '',
        password: '',
        role: 'user',
        instanceId: '',
      });
  }, [user, form, isOpen]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!isEditing && !values.password) {
        form.setError("password", { type: "manual", message: "A senha é obrigatória para novos usuários." });
        return;
    }
    onSave(user ? { ...user, ...values } : values);
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
             <FormField
                control={form.control}
                name="instanceId"
                render={({ field }) => (
                    <FormItem>
                        <Label htmlFor="instanceId">ID da Instância</Label>
                         <FormControl>
                            <Input id="instanceId" {...field} className="bg-[#2a3942] border-none" />
                         </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
             />
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
