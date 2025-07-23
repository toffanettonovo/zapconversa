import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-0 left-0 w-full h-[222px] bg-primary"></div>
      <Card className="z-10 w-full max-w-4xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Logo className="h-10 w-10 text-primary" />
                <h1 className="text-2xl font-bold">WA MANAGER</h1>
              </div>
              <CardHeader className="p-0">
                <CardTitle className="text-3xl font-bold tracking-tight">Use o WA Manager no seu computador</CardTitle>
                <CardDescription className="text-muted-foreground mt-4 text-base">
                  <ol className="list-decimal list-inside space-y-4">
                    <li>Abra o WhatsApp no seu celular</li>
                    <li>Toque em Menu ou Configurações e selecione Aparelhos conectados</li>
                    <li>Aponte seu celular para esta tela para capturar o código</li>
                  </ol>
                </CardDescription>
              </CardHeader>
            </div>
            <Link href="/" className="text-sm text-primary hover:underline mt-8">
              Precisa de ajuda para começar?
            </Link>
          </div>
          <div className="flex items-center justify-center p-8 bg-secondary/30 rounded-r-lg">
            <Link href="/">
              <Image 
                src="https://placehold.co/264x264.png" 
                alt="QR Code" 
                width={264} 
                height={264}
                className="rounded-lg"
                data-ai-hint="qr code"
              />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
