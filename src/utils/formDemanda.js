import { TipoDemanda, ImpactoNegocio, PrioridadeDemanda } from './enums';

/** Estado inicial do formulário de demanda (nova ou edição). */
export function getInitialDemandaForm() {
  return {
    titulo: '',
    descricao: '',
    tipo: TipoDemanda.POST,
    responsavelId: '',
    prazo: '',
    impacto: ImpactoNegocio.LEAD,
    prioridade: PrioridadeDemanda.MEDIA,
    empreendimentoId: '',
    link: '',
  };
}

/** Converte demanda da API para valores do formulário (edição). */
export function demandaToForm(demanda) {
  if (!demanda) return getInitialDemandaForm();
  return {
    titulo: demanda.titulo ?? '',
    descricao: demanda.descricao ?? '',
    tipo: demanda.tipo ?? TipoDemanda.POST,
    responsavelId: String(demanda.responsavelId ?? ''),
    prazo: demanda.prazo ? new Date(demanda.prazo).toISOString().slice(0, 10) : '',
    impacto: demanda.impacto ?? ImpactoNegocio.LEAD,
    prioridade: demanda.prioridade ?? PrioridadeDemanda.MEDIA,
    empreendimentoId: demanda.empreendimentoId ? String(demanda.empreendimentoId) : '',
    link: demanda.link ?? '',
  };
}

/** Converte valores do form para payload da API (criar/atualizar). */
export function formToDemandaPayload(form) {
  return {
    titulo: form.titulo,
    descricao: form.descricao?.trim() || null,
    tipo: Number(form.tipo),
    responsavelId: Number(form.responsavelId),
    prazo: new Date(form.prazo).toISOString(),
    impacto: Number(form.impacto),
    prioridade: Number(form.prioridade),
    empreendimentoId: form.empreendimentoId ? Number(form.empreendimentoId) : null,
    link: form.link?.trim() || null,
  };
}
