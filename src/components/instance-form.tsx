// src/components/instance-form.tsx
'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { type Instance } from '@/lib/data';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  apiUrl: z.string().url('A URL da API é inválida.'),
  apiKey: z.string().min(1, 'A chave da API é obrigatória.'),
  webhookUrl: z.string().url('A URL do Webhook deve ser uma URL válida.').or(z.literal('')),
  isActive: z.boolean(),
});

type InstanceFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (instance: Omit<Instance, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity'> | (Omit<Instance, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity'> & { id: string })) => void;
  instance?: Instance;
};

export function InstanceForm({ isOpen, onOpenChange, onSave, instance }: InstanceFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: instance || {
      name: '',
      apiUrl: '',
      apiKey: '',
      webhookUrl: '',
      isActive: true,
    },
  });

  useEffect(() => {
    form.reset(instance || {
      name: '',
      apiUrl: '',
      apiKey: '',
      webhookUrl: '',
      isActive: true,
    });
  }, [instance, form, isOpen]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(instance ? { ...instance, ...values } : values);
  };

  const handleCopyWebhook = (url: string) => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast({ title: 'Copiado!', description: 'URL do Webhook copiada para a área de transferência.' });
    }
  };

  const generatedWebhookUrl = instance ? `${form.getValues('webhookUrl')}/api/webhook/${instance.id}` : 'Salve a instância para gerar a URL';


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
             <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                <FormItem>
                  <Label htmlFor="webhookUrl">Host do Webhook (ngrok)</Label>
                  <FormControl>
                    <Input 
                      id="webhookUrl" 
                      {...field} 
                      className="bg-[#2a3942] border-none" 
                      placeholder="Cole a URL base do ngrok aqui (ex: https://...).ngrok-free.app" 
                     />
                  </FormControl>
                   <p className="text-xs text-gray-500">Cole apenas a URL principal que o ngrok fornece.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            {instance && (
               <div className="space-y-2">
                  <Label>URL Final do Webhook (Pronta)</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={`${form.watch('webhookUrl')}/api/webhook/${instance.id}`} 
                      readOnly 
                      className="bg-[#2a3942] border-none text-gray-400"
                    />
                     <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" type="button" onClick={() => handleCopyWebhook(`${form.watch('webhookUrl')}/api/webhook/${instance.id}`)}>
                        <Copy className="h-4 w-4" />
                     </Button>
                  </div>
                  <p className="text-xs text-gray-500">Use esta URL final na sua plataforma da Evolution API.</p>
               </div>
            )}
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
