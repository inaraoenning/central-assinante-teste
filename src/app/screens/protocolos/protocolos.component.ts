import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { EmpresaService } from '../../core/auth/empresa.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-protocolos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './protocolos.component.html',
})
export class ProtocolosComponent implements OnInit {
  private authService = inject(AuthService);
  private empresaService = inject(EmpresaService);
  private http = inject(HttpClient);

  user = this.authService.usuarioAtual();
  data = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    // this.loadProtocolos();
  }

  loadProtocolos() {
    const cliente = this.user();
    if (!cliente) return;

    // this.isLoading.set(true);
    // const url = `${this.empresaService.apiUrl}app/protocolos/${cliente.codigo}`;

    // this.http.get<any[]>(url).subscribe({
    //   next: (res) => {
    //     this.data.set(res || []);
    //     this.isLoading.set(false);
    //   },
    //   error: (err) => {
    //     console.error('Erro ao carregar protocolos:', err);
    //     this.isLoading.set(false);
    //   },
    // });
  }
}
