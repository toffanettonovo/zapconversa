// src/components/instance-form.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { type Instance } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  apiUrl: z.string().url('A URL da API é inválida.'),
  apiKey: z.string().min(1, 'A chave da API é obrigatória.'),
  isActive: z.boolean(),
});

type InstanceFormData = z.infer<typeof formSchema>;

type InstanceFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (instance: Omit<Instance, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity' | 'webhookUrl'> & { id?: string }) => void;
  instance?: Instance;
};

export function InstanceForm({ isOpen, onOpenChange, onSave, instance }: InstanceFormProps) {
  const form = useForm<InstanceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: instance || {
      name: '',
      apiUrl: '',
      apiKey: '',
      isActive: true,
    },
  });

  useEffect(() => {
    form.reset(instance || {
      name: '',
      apiUrl: '',
      apiKey: '',
      isActive: true,
    });
  }, [instance, form, isOpen]);

  const onSubmit = (values: InstanceFormData) => {
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
                    <Input id="apiUrl" {...field} className="bg-[#2a3942] border-none" placeholder="Ex: http://localhost:8081" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="apiKey">Chave da API</Label>
                  <FormControl>
                    <Input id="apiKey" {...field} className="bg-[#2a3942] border-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="space-y-2">
                <Label>URL do Webhook</Label>
                 <p className="text-xs text-gray-500">A URL do webhook é agora gerenciada dinamicamente na tela principal do painel de administração.</p>
             </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-[#2a3942] border-none">
                  <div className="space-y-0.5">
                    <FormLabel>Ativa</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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

    