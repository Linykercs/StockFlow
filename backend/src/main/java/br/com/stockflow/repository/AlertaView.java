package br.com.stockflow.repository;

import java.math.BigDecimal;
import java.time.LocalDate;

// Uma linha da view vw_alertas. O Spring preenche pelos nomes das colunas da consulta em LoteRepository.buscarAlertas.
public interface AlertaView {

    String getTipo();

    Long getProdutoId();

    String getProdutoNome();

    Long getLoteId();

    String getLoteCodigo();

    LocalDate getDataValidade();

    BigDecimal getQuantidade();
}
