import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../core/data.service';
import { Documento } from '../core/models';
import { ModalComponent } from '../shared/modal.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { IconComponent } from '../shared/icon.component';
import { ToastService } from '../core/toast.service';
import {
  formatDate,
  formatDateTime,
  formatFileSize,
  generateId,
  getFileType,
  todayISO,
} from '../core/utils';

const CATEGORIAS = ['Ata', 'Regulamento', 'Edital', 'Financeiro', 'Evento', 'Outros'];
const CAT_COLORS: Record<string, string> = {
  Ata: 'badge-blue',
  Regulamento: 'badge-purple',
  Edital: 'badge-yellow',
  Financeiro: 'badge-green',
  Evento: 'badge-orange',
  Outros: 'badge-gray',
};

@Component({
  selector: 'app-documentos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeaderComponent, ModalComponent, IconComponent],
  template: `
    <app-page-header kicker="Arquivos" title="Documentos" subtitle="Gerencie arquivos e documentos do CA">
      <button class="btn btn-primary" (click)="abrirUpload()"><app-icon name="upload" /> Enviar Documento</button>
    </app-page-header>

    <div class="content">
      <!-- Filtros -->
      <div class="table-card" style="margin-bottom:20px">
        <div style="padding:14px 20px">
          <div class="filters-row">
            <div class="search-input-wrap" style="flex:1;min-width:200px">
              <input
                type="text"
                class="form-control"
                placeholder="Buscar documentos..."
                [ngModel]="search()"
                (ngModelChange)="search.set($event)"
              />
            </div>
            <select class="form-control" style="width:auto" [ngModel]="catFilter()" (ngModelChange)="catFilter.set($event)">
              <option value="">Todas as categorias</option>
              @for (c of categorias; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
            <select class="form-control" style="width:auto" [ngModel]="tipoFilter()" (ngModelChange)="tipoFilter.set($event)">
              <option value="">Todos os tipos</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word</option>
              <option value="xlsx">Excel</option>
              <option value="pptx">PowerPoint</option>
              <option value="imagem">Imagem</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Grid -->
      @if (filtrados().length) {
        <div class="docs-grid">
          @for (doc of filtrados(); track doc.id) {
            <div class="doc-card" (click)="ver(doc)">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                <div class="doc-card-icon">
                  <app-icon name="file" [size]="26" />
                  <span class="doc-card-ext">{{ (doc.tipo || 'arquivo').toUpperCase() }}</span>
                </div>
                <span class="badge {{ catColor(doc.categoria) }}">{{ doc.categoria || 'Sem categoria' }}</span>
              </div>
              <div class="doc-card-name">{{ doc.nome }}</div>
              @if (doc.descricao) {
                <div style="font-size:12px;color:var(--text-muted);line-height:1.4">{{ doc.descricao }}</div>
              }
              <div class="doc-card-meta">
                {{ doc.data ? fmtDate(doc.data) : fmtDateTime(doc.uploadEm) }}{{ doc.tamanho ? ' · ' + doc.tamanho : '' }}
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-state-icon"><app-icon name="documents" [size]="40" /></div>
          <h3>Nenhum documento encontrado</h3>
          <p>Envie o primeiro documento clicando em "Enviar Documento".</p>
          <button type="button" class="btn btn-primary" (click)="abrirUpload()"><app-icon name="upload" /> Enviar Documento</button>
        </div>
      }
    </div>

    <!-- Modal Upload -->
    <app-modal [open]="uploadOpen()" title="Enviar Documento" (closed)="uploadOpen.set(false)">
      <div
        class="upload-zone"
        [class.dragover]="dragging()"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="dragging.set(false)"
        (drop)="onDrop($event)"
      >
        <div class="upload-zone-icon"><app-icon name="upload" [size]="34" /></div>
        <p><strong>Clique para selecionar</strong> ou arraste um arquivo aqui</p>
        <p><small>PDF, Word, Excel, PowerPoint, imagens · máx. 10 MB</small></p>
        @if (selectedFile()) {
          <div style="margin-top:14px;font-family:var(--font-mono);font-size:11.5px;color:var(--green);letter-spacing:.03em">
            {{ selectedFile()!.name }} · {{ fmtSize(selectedFile()!.size) }}
          </div>
        }
      </div>
      <input
        #fileInput
        type="file"
        style="display:none"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.csv,.zip"
        (change)="onFileSelected($event)"
      />

      <div style="margin-top:16px">
        <div class="form-group">
          <label class="form-label">Nome do arquivo <span>*</span></label>
          <input type="text" class="form-control" placeholder="Ex: Ata Reunião Março 2024" [(ngModel)]="form.nome" />
        </div>
        <div class="form-row form-row-2">
          <div class="form-group">
            <label class="form-label">Categoria <span>*</span></label>
            <select class="form-control" [(ngModel)]="form.categoria">
              <option value="">Selecionar...</option>
              @for (c of categorias; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Data do documento</label>
            <input type="date" class="form-control" [(ngModel)]="form.data" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <textarea class="form-control" rows="2" placeholder="Descreva brevemente o conteúdo do documento..." [(ngModel)]="form.descricao"></textarea>
        </div>
      </div>

      <ng-container modal-footer>
        <button class="btn btn-outline" (click)="uploadOpen.set(false)">Cancelar</button>
        <button class="btn btn-primary" (click)="salvar()"><app-icon name="upload" /> Salvar Documento</button>
      </ng-container>
    </app-modal>

    <!-- Modal Visualizar -->
    <app-modal [open]="!!viewing()" [title]="viewing()?.nome || 'Documento'" (closed)="viewing.set(null)">
      @if (viewing(); as doc) {
        <div class="detail-row"><span class="detail-label">Nome</span><span class="detail-value">{{ doc.nome }}</span></div>
        <div class="detail-row">
          <span class="detail-label">Categoria</span>
          <span class="detail-value"><span class="badge {{ catColor(doc.categoria) }}">{{ doc.categoria || '—' }}</span></span>
        </div>
        <div class="detail-row"><span class="detail-label">Tipo</span><span class="detail-value">{{ (doc.tipo || '').toUpperCase() || '—' }}</span></div>
        <div class="detail-row"><span class="detail-label">Tamanho</span><span class="detail-value">{{ doc.tamanho || '—' }}</span></div>
        <div class="detail-row"><span class="detail-label">Data</span><span class="detail-value">{{ doc.data ? fmtDate(doc.data) : '—' }}</span></div>
        <div class="detail-row"><span class="detail-label">Enviado em</span><span class="detail-value">{{ fmtDateTime(doc.uploadEm) }}</span></div>
        @if (doc.descricao) {
          <hr class="divider" />
          <div style="font-size:13.5px;color:var(--text-soft);line-height:1.6">{{ doc.descricao }}</div>
        }
        <hr class="divider" />
        <div style="font-size:12px;color:var(--text-dim);background:var(--bg-2);border-radius:8px;padding:10px;text-align:center">
          {{ doc.fileData ? 'Arquivo disponível para download' : 'Arquivo sem dados (adicionado manualmente)' }}
        </div>
      }

      <ng-container modal-footer>
        <button class="btn btn-danger btn-sm" (click)="excluir(viewing()!)"><app-icon name="trash" /> Excluir</button>
        <button class="btn btn-outline" (click)="viewing.set(null)">Fechar</button>
        <button class="btn btn-primary" [disabled]="!viewing()?.fileData" (click)="baixar(viewing()!)"><app-icon name="download" /> Baixar</button>
      </ng-container>
    </app-modal>
  `,
})
export class DocumentosComponent {
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly categorias = CATEGORIAS;

  readonly search = signal('');
  readonly catFilter = signal('');
  readonly tipoFilter = signal('');

  readonly uploadOpen = signal(false);
  readonly viewing = signal<Documento | null>(null);
  readonly dragging = signal(false);
  readonly selectedFile = signal<File | null>(null);

  form = { nome: '', categoria: '', data: todayISO(), descricao: '' };

  readonly filtrados = computed<Documento[]>(() => {
    const s = this.search().toLowerCase();
    const cat = this.catFilter();
    const tipo = this.tipoFilter();
    let docs = this.data.documentos.items();
    if (s) docs = docs.filter((d) => d.nome.toLowerCase().includes(s) || (d.descricao || '').toLowerCase().includes(s));
    if (cat) docs = docs.filter((d) => d.categoria === cat);
    if (tipo) {
      const map: Record<string, string[]> = { imagem: ['png', 'jpg', 'jpeg', 'gif', 'webp'] };
      const tipos = map[tipo] || [tipo];
      docs = docs.filter((d) => tipos.includes((d.tipo || '').toLowerCase()));
    }
    return docs;
  });

  fmtDate = formatDate;
  fmtDateTime = formatDateTime;
  fmtSize = formatFileSize;
  catColor = (c: string) => CAT_COLORS[c] || 'badge-gray';

  abrirUpload(): void {
    this.resetForm();
    this.uploadOpen.set(true);
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(true);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  onFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File): void {
    if (file.size > 10 * 1024 * 1024) {
      this.toast.show('Arquivo muito grande. Limite: 10 MB.', 'error');
      return;
    }
    this.selectedFile.set(file);
    this.form.nome = file.name.replace(/\.[^.]+$/, '');
  }

  salvar(): void {
    const nome = this.form.nome.trim();
    if (!nome) return this.toast.show('Informe o nome do documento.', 'error');
    if (!this.form.categoria) return this.toast.show('Selecione uma categoria.', 'error');

    const file = this.selectedFile();
    const tipo = file ? getFileType(file.name) : 'arquivo';
    const tamanho = file ? formatFileSize(file.size) : 'desconhecido';

    const persist = (fileData: string | null) => {
      const doc: Documento = {
        id: generateId(),
        nome: nome + (file && !nome.includes('.') ? '.' + tipo : ''),
        categoria: this.form.categoria,
        descricao: this.form.descricao.trim(),
        data: this.form.data,
        tipo,
        tamanho,
        uploadEm: new Date().toISOString(),
        fileData,
      };
      this.data.documentos.add(doc, true);
      this.toast.show('Documento salvo com sucesso!');
      this.uploadOpen.set(false);
      this.resetForm();
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => persist(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      persist(null);
    }
  }

  ver(doc: Documento): void {
    this.viewing.set(doc);
  }

  baixar(doc: Documento): void {
    if (!doc.fileData) return this.toast.show('Arquivo não disponível para download.', 'error');
    const a = document.createElement('a');
    a.href = doc.fileData;
    a.download = doc.nome;
    a.click();
  }

  excluir(doc: Documento): void {
    if (!confirm('Excluir este documento permanentemente?')) return;
    this.data.documentos.remove(doc.id);
    this.toast.show('Documento excluído.');
    this.viewing.set(null);
  }

  private resetForm(): void {
    this.selectedFile.set(null);
    this.form = { nome: '', categoria: '', data: todayISO(), descricao: '' };
  }
}
