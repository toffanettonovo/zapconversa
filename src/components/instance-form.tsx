// src/components/instance-form.tsx
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
import { type Instance } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  apiUrl: z.string().url('A URL da API é inválida.'),
  webhook: z.string().url('A URL do Webhook é inválida.'),
  status: z.enum(['connected', 'disconnected']),
});

type InstanceFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (instance: Omit<Instance, 'id'> | Instance) => void;
  instance?: Instance;
};

export function InstanceForm({ isOpen, onOpenChange, onSave, instance }: InstanceFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: instance || {
      name: '',
      apiUrl: '',
      webhook: '',
      status: 'disconnected',
    },
  });

  useEffect(() => {
    form.reset(instance || {
      name: '',
      apiUrl: '',
      webhook: '',
      status: 'disconnected',
    });
  }, [instance, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(instance ? { ...instance, ...values } : values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111b21] border-[#1f2c33] text-white">
        <DialogHeader>
          <DialogTitle>{instance ? 'Editar Instância' : 'Adicionar Instância'}</DialogTitle>
          <DialogDescription>
            {instance ? 'Edite os detalhes da instância.' : 'Preencha os detalhes da nova instância.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name">Nome da Instância</Label>
                  <FormControl>
                    <Input id="name" {...field} className="bg-[#2a3942] border-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiUrl"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="apiUrl">URL da API</Label>
                  <FormControl>
                    <Input id="apiUrl" {...field} className="bg-[#2a3942] border-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="webhook"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="webhook">Webhook</Label>
                  <FormControl>
                    <Input id="webhook" {...field} className="bg-[#2a3942] border-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <Label>Status</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#2a3942] border-none">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#111b21] border-[#1f2c33] text-white">
                      <SelectItem value="connected" className="hover:!bg-[#2a3942]">Conectado</SelectItem>
                      <SelectItem value="disconnected" className="hover:!bg-[#2a3942]">Desconectado</SelectItem>
                    </SelectContent>
                  </Select>
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
