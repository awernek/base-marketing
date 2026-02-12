import { describe, it, expect } from 'vitest';
import { getInitialDemandaForm, demandaToForm, formToDemandaPayload } from './formDemanda';
import { TipoDemanda, ImpactoNegocio, PrioridadeDemanda } from './enums';

describe('formDemanda', () => {
  it('getInitialDemandaForm retorna estado inicial', () => {
    const initial = getInitialDemandaForm();
    expect(initial.titulo).toBe('');
    expect(initial.tipo).toBe(TipoDemanda.NOVA_PECA);
    expect(initial.impacto).toBe(ImpactoNegocio.LEAD);
    expect(initial.prioridade).toBe(PrioridadeDemanda.MEDIA);
    expect(initial.responsavelId).toBe('');
    expect(initial.prazo).toBe('');
  });

  it('demandaToForm preenche a partir de demanda', () => {
    const demanda = {
      id: 1,
      titulo: 'Teste',
      tipo: TipoDemanda.CAMPANHA,
      responsavelId: 5,
      prazo: '2025-03-01T00:00:00.000Z',
      impacto: ImpactoNegocio.VENDA,
      prioridade: PrioridadeDemanda.ALTA,
      empreendimentoId: 2,
      link: 'https://exemplo.com',
    };
    const form = demandaToForm(demanda);
    expect(form.titulo).toBe('Teste');
    expect(form.tipo).toBe(TipoDemanda.CAMPANHA);
    expect(form.responsavelId).toBe('5');
    expect(form.prazo).toBe('2025-03-01');
    expect(form.empreendimentoId).toBe('2');
    expect(form.link).toBe('https://exemplo.com');
  });

  it('formToDemandaPayload converte para payload da API', () => {
    const form = {
      titulo: 'Título',
      descricao: '  desc  ',
      tipo: TipoDemanda.LANDING,
      responsavelId: '3',
      prazo: '2025-04-15',
      impacto: ImpactoNegocio.INSTITUCIONAL,
      prioridade: PrioridadeDemanda.BAIXA,
      empreendimentoId: '1',
      link: '  https://link.com  ',
    };
    const payload = formToDemandaPayload(form);
    expect(payload.titulo).toBe('Título');
    expect(payload.descricao).toBe('desc');
    expect(payload.tipo).toBe(TipoDemanda.LANDING);
    expect(payload.responsavelId).toBe(3);
    expect(payload.empreendimentoId).toBe(1);
    expect(payload.link).toBe('https://link.com');
  });
});
