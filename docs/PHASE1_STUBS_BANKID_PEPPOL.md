# Phase 1 Stubs: BankID & PEPPOL Interfaces

## Översikt
Detta dokument definierar interfaces och stubbar för BankID och PEPPOL-integrationer som kommer implementeras i Fas 2.

---

## A) BankID Signering - Interface & Stub

### Interface: `ISignatureProvider`

```typescript
// app/lib/signatures/ISignatureProvider.ts
export interface ISignatureProvider {
  /**
   * Initierar signeringsprocess
   * @param documentType Typ av dokument (quote, ata, invoice, etc.)
   * @param documentId ID på dokumentet
   * @param signerEmail Email på signatär
   * @param options Ytterligare options (expiresAt, etc.)
   * @returns Signering ID och signeringslänk
   */
  initiateSignature(
    documentType: string,
    documentId: string,
    signerEmail: string,
    options?: SignatureOptions
  ): Promise<SignatureInitResponse>;

  /**
   * Kontrollerar signeringsstatus
   * @param signatureId Signering ID
   * @returns Status och signeringsdata
   */
  checkSignatureStatus(signatureId: string): Promise<SignatureStatusResponse>;

  /**
   * Verifierar signatur (hash + tidsstämpel)
   * @param signatureId Signering ID
   * @param documentHash Hash av dokumentet
   * @returns Verifieringsresultat
   */
  verifySignature(
    signatureId: string,
    documentHash: string
  ): Promise<VerificationResponse>;
}

export interface SignatureOptions {
  expiresAt?: Date;
  message?: string;
  redirectUrl?: string;
}

export interface SignatureInitResponse {
  signatureId: string;
  signingUrl: string;
  expiresAt: Date;
}

export interface SignatureStatusResponse {
  status: 'pending' | 'signed' | 'rejected' | 'expired';
  signedAt?: Date;
  signerInfo?: {
    name: string;
    personalNumber?: string;
  };
  signatureHash?: string;
}

export interface VerificationResponse {
  valid: boolean;
  verifiedAt: Date;
  signerInfo?: {
    name: string;
    personalNumber?: string;
  };
}
```

### Stub Implementation: `EmailSignatureProvider`

```typescript
// app/lib/signatures/EmailSignatureProvider.ts
import { ISignatureProvider, SignatureInitResponse, SignatureStatusResponse, VerificationResponse } from './ISignatureProvider';

export class EmailSignatureProvider implements ISignatureProvider {
  async initiateSignature(
    documentType: string,
    documentId: string,
    signerEmail: string,
    options?: SignatureOptions
  ): Promise<SignatureInitResponse> {
    // Stub: Skapar signature-record i databas
    // Genererar signeringslänk med JWT token
    // Skickar email med länk
    
    const signatureId = crypto.randomUUID();
    const token = await this.generateSigningToken(signatureId, documentId);
    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/public/sign/${token}`;
    
    // Skapa signature-record
    await this.createSignatureRecord({
      id: signatureId,
      documentType,
      documentId,
      signerEmail,
      signingUrl,
      expiresAt: options?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dagar
      method: 'email'
    });

    // Skicka email (via Resend eller liknande)
    await this.sendSigningEmail(signerEmail, signingUrl, options?.message);

    return {
      signatureId,
      signingUrl,
      expiresAt: options?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  }

  async checkSignatureStatus(signatureId: string): Promise<SignatureStatusResponse> {
    // Stub: Läser från signatures-tabellen
    const signature = await this.getSignatureRecord(signatureId);
    
    return {
      status: signature.status,
      signedAt: signature.signed_at,
      signerInfo: signature.signer_email ? {
        name: signature.signer_email.split('@')[0] // Fallback
      } : undefined,
      signatureHash: signature.signature_hash
    };
  }

  async verifySignature(
    signatureId: string,
    documentHash: string
  ): Promise<VerificationResponse> {
    // Stub: Verifierar hash mot signature-record
    const signature = await this.getSignatureRecord(signatureId);
    
    if (!signature.signature_hash) {
      return { valid: false, verifiedAt: new Date() };
    }

    const isValid = signature.signature_hash === documentHash;
    
    return {
      valid: isValid,
      verifiedAt: new Date(),
      signerInfo: signature.signer_email ? {
        name: signature.signer_email.split('@')[0]
      } : undefined
    };
  }

  private async generateSigningToken(signatureId: string, documentId: string): Promise<string> {
    // JWT token med kort livstid
    return jwt.sign(
      { signatureId, documentId, type: 'signature' },
      process.env.SIGNATURE_SECRET!,
      { expiresIn: '7d' }
    );
  }

  private async createSignatureRecord(data: any): Promise<void> {
    // Insert into signatures table
  }

  private async getSignatureRecord(signatureId: string): Promise<any> {
    // Select from signatures table
  }

  private async sendSigningEmail(email: string, url: string, message?: string): Promise<void> {
    // Send email via Resend
  }
}
```

### Future Implementation: `BankIDSignatureProvider`

```typescript
// app/lib/signatures/BankIDSignatureProvider.ts (Fas 2)
import { ISignatureProvider } from './ISignatureProvider';

export class BankIDSignatureProvider implements ISignatureProvider {
  private bankIdClient: BankIDClient; // T.ex. Freja eID, Signicat, etc.

  async initiateSignature(...): Promise<SignatureInitResponse> {
    // BankID API-anrop
    // Returnera BankID signeringslänk
  }

  async checkSignatureStatus(...): Promise<SignatureStatusResponse> {
    // BankID status-check
  }

  async verifySignature(...): Promise<VerificationResponse> {
    // BankID verifiering
  }
}
```

### Factory Pattern

```typescript
// app/lib/signatures/SignatureProviderFactory.ts
import { ISignatureProvider } from './ISignatureProvider';
import { EmailSignatureProvider } from './EmailSignatureProvider';
import { BankIDSignatureProvider } from './BankIDSignatureProvider';

export class SignatureProviderFactory {
  static create(tenantId: string): ISignatureProvider {
    // Kontrollera feature flag
    const enableBankId = await getFeatureFlag(tenantId, 'enable_bankid');
    
    if (enableBankId) {
      return new BankIDSignatureProvider();
    }
    
    return new EmailSignatureProvider();
  }
}
```

---

## B) PEPPOL E-faktura - Interface & Stub

### Interface: `IInvoiceExporter`

```typescript
// app/lib/invoices/IInvoiceExporter.ts
export interface IInvoiceExporter {
  /**
   * Exporterar faktura till PEPPOL XML (EN16931)
   * @param invoiceId Faktura ID
   * @returns PEPPOL XML som string
   */
  exportToPEPPOL(invoiceId: string): Promise<string>;

  /**
   * Skickar faktura till PEPPOL network
   * @param invoiceId Faktura ID
   * @param recipientGLN GLN för mottagare
   * @returns Message ID från PEPPOL
   */
  sendToPEPPOL(invoiceId: string, recipientGLN: string): Promise<PEPPOLSendResponse>;

  /**
   * Kontrollerar status för PEPPOL-meddelande
   * @param messageId PEPPOL message ID
   * @returns Status och leveransinfo
   */
  checkPEPPOLStatus(messageId: string): Promise<PEPPOLStatusResponse>;

  /**
   * Genererar PEPPOL XML för lokal download (utan att skicka)
   * @param invoiceId Faktura ID
   * @returns PEPPOL XML
   */
  generatePEPPOLXML(invoiceId: string): Promise<string>;
}

export interface PEPPOLSendResponse {
  messageId: string;
  sentAt: Date;
  recipientGLN: string;
}

export interface PEPPOLStatusResponse {
  status: 'sent' | 'delivered' | 'failed';
  deliveredAt?: Date;
  errorMessage?: string;
}
```

### Stub Implementation: `PDFInvoiceExporter`

```typescript
// app/lib/invoices/PDFInvoiceExporter.ts
import { IInvoiceExporter } from './IInvoiceExporter';

export class PDFInvoiceExporter implements IInvoiceExporter {
  async exportToPEPPOL(invoiceId: string): Promise<string> {
    // Stub: Returnera felmeddelande eller mock XML
    throw new Error('PEPPOL export not enabled. Use PDF export instead.');
  }

  async sendToPEPPOL(invoiceId: string, recipientGLN: string): Promise<PEPPOLSendResponse> {
    throw new Error('PEPPOL sending not enabled.');
  }

  async checkPEPPOLStatus(messageId: string): Promise<PEPPOLStatusResponse> {
    throw new Error('PEPPOL status check not enabled.');
  }

  async generatePEPPOLXML(invoiceId: string): Promise<string> {
    // Stub: Generera mock PEPPOL XML (för test)
    return this.generateMockPEPPOLXML(invoiceId);
  }

  private async generateMockPEPPOLXML(invoiceId: string): Promise<string> {
    // Mock XML för testning
    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <!-- Mock PEPPOL XML - Replace with real implementation in Phase 2 -->
</Invoice>`;
  }
}
```

### Future Implementation: `PEPPOLInvoiceExporter`

```typescript
// app/lib/invoices/PEPPOLInvoiceExporter.ts (Fas 2)
import { IInvoiceExporter } from './IInvoiceExporter';
import { PEPPOLClient } from '@peppol/peppol-client'; // T.ex. OpenPeppol eller liknande

export class PEPPOLInvoiceExporter implements IInvoiceExporter {
  private peppolClient: PEPPOLClient;

  async exportToPEPPOL(invoiceId: string): Promise<string> {
    // Hämta faktura-data
    const invoice = await this.getInvoiceData(invoiceId);
    
    // Konvertera till PEPPOL XML (EN16931)
    const xml = await this.convertToPEPPOLXML(invoice);
    
    return xml;
  }

  async sendToPEPPOL(invoiceId: string, recipientGLN: string): Promise<PEPPOLSendResponse> {
    const xml = await this.exportToPEPPOL(invoiceId);
    
    // Skicka via PEPPOL network
    const response = await this.peppolClient.send(xml, recipientGLN);
    
    return {
      messageId: response.messageId,
      sentAt: new Date(),
      recipientGLN
    };
  }

  async checkPEPPOLStatus(messageId: string): Promise<PEPPOLStatusResponse> {
    const status = await this.peppolClient.getStatus(messageId);
    
    return {
      status: status.delivered ? 'delivered' : 'sent',
      deliveredAt: status.deliveredAt,
      errorMessage: status.error
    };
  }

  private async convertToPEPPOLXML(invoice: any): Promise<string> {
    // Konvertera faktura-data till PEPPOL XML (EN16931)
    // Använd bibliotek som peppol-bis-invoice-3 eller liknande
  }
}
```

### Factory Pattern

```typescript
// app/lib/invoices/InvoiceExporterFactory.ts
import { IInvoiceExporter } from './IInvoiceExporter';
import { PDFInvoiceExporter } from './PDFInvoiceExporter';
import { PEPPOLInvoiceExporter } from './PEPPOLInvoiceExporter';

export class InvoiceExporterFactory {
  static create(tenantId: string): IInvoiceExporter {
    const enablePeppol = await getFeatureFlag(tenantId, 'enable_peppol');
    
    if (enablePeppol) {
      return new PEPPOLInvoiceExporter();
    }
    
    return new PDFInvoiceExporter();
  }
}
```

---

## Användning i API Routes

### Exempel: Signering

```typescript
// app/api/ata/[id]/sign/route.ts
import { SignatureProviderFactory } from '@/lib/signatures/SignatureProviderFactory';
import { getTenantId } from '@/lib/serverTenant';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const tenantId = await getTenantId();
  const provider = SignatureProviderFactory.create(tenantId);
  
  const { signerEmail } = await req.json();
  
  const result = await provider.initiateSignature(
    'ata',
    params.id,
    signerEmail
  );
  
  return Response.json(result);
}
```

### Exempel: PEPPOL Export

```typescript
// app/api/invoices/[id]/peppol/route.ts
import { InvoiceExporterFactory } from '@/lib/invoices/InvoiceExporterFactory';
import { getTenantId } from '@/lib/serverTenant';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const tenantId = await getTenantId();
  const exporter = InvoiceExporterFactory.create(tenantId);
  
  const { recipientGLN } = await req.json();
  
  const result = await exporter.sendToPEPPOL(params.id, recipientGLN);
  
  return Response.json(result);
}
```

---

## Migration Path

1. **Fas 1**: Använd stubbar (EmailSignatureProvider, PDFInvoiceExporter)
2. **Fas 2**: Implementera riktiga providers (BankIDSignatureProvider, PEPPOLInvoiceExporter)
3. **Aktivering**: Via feature flags per tenant
4. **Rollback**: Om problem, ändra feature flag tillbaka till stub

