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
  role: z.enum(['admin', 'user']),
  instance: z.string().min(1, 'A instância é obrigatória.'),
});

type UserFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (user: Omit<User, 'id'> | User) => void;
  user?: User;
};

export function UserForm({ isOpen, onOpenChange, onSave, user }: UserFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: user || {
      name: '',
      role: 'user',
      instance: '',
    },
  });
  
  useEffect(() => {
    form.reset(user || {
        name: '',
        role: 'user',
        instance: '',
      });
  }, [user, form]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
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
                name="instance"
                render={({ field }) => (
                    <FormItem>
                        <Label htmlFor="instance">Instância</Label>
                         <FormControl>
                            <Input id="instance" {...field} className="bg-[#2a3942] border-none" />
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
