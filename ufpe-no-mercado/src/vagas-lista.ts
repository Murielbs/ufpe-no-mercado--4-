/**
 * LISTA OFICIAL DE VAGAS (exportada do Gupy).
 *
 * Para atualizar: apague o conteúdo entre as crases e cole a lista nova,
 * uma vaga por linha, no formato:
 *   TÍTULO Cidade - UF Tipo | https://…gupy.io/jobs/000000
 *
 * O arquivo vagas.ts lê estas linhas e classifica cada vaga sozinho
 * (nível, área, cursos, escolaridade). Ajustes pontuais ficam em AJUSTES, no vagas.ts.
 */
export const LISTA_BRUTA = `
[ RSM RS] ESTAGIÁRIO(A) COMERCIAL Canoas - RS Estágio | https://grupomoura.gupy.io/jobs/12281612
[RSM PE] ASSISTENTE TÉCNICO Jaboatão dos Guararapes - PE Efetivo | https://grupomoura.gupy.io/jobs/12198134
AJUDANTE DE MOTORISTA - CARGA E DESCARGA Diadema - SP Efetivo | https://redemoura.gupy.io/jobs/12213104
ANALISTA ADM FISCAL Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11599789
ANALISTA CONTÁBIL Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11774835
ANALISTA DE APLICAÇÃO Itapetininga - SP Efetivo | https://grupomoura.gupy.io/jobs/11188255
ANALISTA DE ATRAÇÃO E SELEÇÃO Recife - PE Efetivo | https://redemoura.gupy.io/jobs/12429677
ANALISTA DE ENGENHARIA DE PRODUTO Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11376667
ANALISTA DE ENGENHARIA DE PROJETOS Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11590202
ANALISTA DE GESTÃO Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11622298
ANALISTA DE GESTÃO Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11745842
ANALISTA DE GESTÃO DE PESSOAS Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/12145128
ANALISTA DE GESTÃO DE PESSOAS Jaboatão dos Guararapes - PE Efetivo | https://grupomoura.gupy.io/jobs/11941246
ANALISTA DE PCP Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/10912060
ANALISTA DE PESSOAS JR Jaboatão dos Guararapes - PE Efetivo | https://grupomoura.gupy.io/jobs/11881318
ANALISTA DE PLANEJAMENTO FINANCEIRO (PLENO) Recife - PE Efetivo | https://redemoura.gupy.io/jobs/7046564
ANALISTA DE PLANEJAMENTO FINANCEIRO PL Jaboatão dos Guararapes - PE Efetivo | https://grupomoura.gupy.io/jobs/11887697
ANALISTA DE PROJETOS DE TI PL Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11743238
ASSISTENTE ADMINISTRATIVO FINANCEIRO Cachoeiro de Itapemirim - ES Efetivo | https://redemoura.gupy.io/jobs/12144073
ASSISTENTE ADMINISTRATIVO FINANCEIRO - PASSO FUNDO/RS Passo Fundo - RS Efetivo | https://redemoura.gupy.io/jobs/12316980
ASSISTENTE COMERCIAL São Paulo - SP Efetivo | https://redemoura.gupy.io/jobs/11892154
ASSISTENTE COMERCIAL Porto Velho - RO Efetivo | https://redemoura.gupy.io/jobs/11505725
ASSISTENTE CONTÁBIL Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11774678
ASSISTENTE DE ATRAÇÃO E SELEÇÃO Recife - PE Efetivo | https://redemoura.gupy.io/jobs/11758109
ASSISTENTE DE ATRAÇÃO E SELEÇÃO Teresina - PI Efetivo | https://redemoura.gupy.io/jobs/12301175
ASSISTENTE DE ATRAÇÃO E SELEÇÃO Fortaleza - CE Efetivo | https://redemoura.gupy.io/jobs/12308755
ASSISTENTE DE LOGÍSTICA Cabo de Santo Agostinho - PE Efetivo | https://grupomoura.gupy.io/jobs/11583740
ASSISTENTE TECNICO - LEROY MERLIN (CAJAMAR) Cajamar - SP Efetivo | https://grupomoura.gupy.io/jobs/12212838
ASSISTENTE TÉCNICO - RSM ES Serra - ES Efetivo | https://grupomoura.gupy.io/jobs/11976145
ASSISTENTE TECNICO - RSM INDAIATUBA Indaiatuba - SP Efetivo | https://grupomoura.gupy.io/jobs/12038746
ASSISTENTE TECNICO - RSM INDAIATUBA Indaiatuba - SP Efetivo | https://grupomoura.gupy.io/jobs/12038851
ASSISTENTE TECNICO - RSM SP Barueri - SP Efetivo | https://grupomoura.gupy.io/jobs/11645795
ASSISTENTE TÉCNICO (TÉCNICO EM BATERIAS) | BOQUEIRÃO, CURITIBA/PR Curitiba - PR Efetivo | https://redemoura.gupy.io/jobs/12045720
ASSISTENTE TÉCNICO RSM ES Serra - ES Efetivo | https://grupomoura.gupy.io/jobs/11976113
AUDITOR INTERNO PL | RECIFE - PE Recife - PE Efetivo | https://redemoura.gupy.io/jobs/12418948
AUXILIAR ADMINISTRATIVO Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11698900
AUXILIAR DE ENTREGA - GOVERNADOR VALADARES / MG (CNH B) Governador Valadares - MG Efetivo | https://redemoura.gupy.io/jobs/11611063
AUXILIAR DE ENTREGAS - CASCAVEL/PR Cascavel - PR Efetivo | https://redemoura.gupy.io/jobs/12374799
AUXILIAR DE ENTREGAS - LINHARES/ES Linhares - ES Efetivo | https://redemoura.gupy.io/jobs/12271371
AUXILIAR DE ENTREGAS - LINHARES/ES Linhares - ES Efetivo | https://redemoura.gupy.io/jobs/12271413
AUXILIAR DE ENTREGAS - PARACATU/MG Montes Claros - MG Efetivo | https://redemoura.gupy.io/jobs/12374249
AUXILIAR DE ESTOQUE Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11723996
AUXILIAR DE ESTOQUE - RIBEIRÃO PRETO/SP Ribeirão Preto - SP Efetivo | https://redemoura.gupy.io/jobs/12489687
AUXILIAR DE ESTOQUE - SÃO JOSÉ DO RIO PRETO/SP São José do Rio Preto - SP Efetivo | https://redemoura.gupy.io/jobs/12464119
AUXILIAR ENTREGA (CARGA E DESCARGA) - GOIÂNIA/GO Goiânia - GO Efetivo | https://redemoura.gupy.io/jobs/12277995
AUXILIAR ENTREGA (CARGA E DESCARGA) - GOIÂNIA/GO (CÓPIA) Goiânia - GO Efetivo | https://redemoura.gupy.io/jobs/12278320
AUXILIAR OPERACIONAL DE LOGÍSTICA Osasco - SP Efetivo | https://redemoura.gupy.io/jobs/10699524
AUXILIAR OPERACIONAL DE LOGÍSTICA São Paulo - SP Efetivo | https://redemoura.gupy.io/jobs/10699592
AUXILIAR OPERACIONAL DE LOGÍSTICA São Paulo - SP Efetivo | https://redemoura.gupy.io/jobs/10926391
AUXILIAR OPERACIONAL DE LOGÍSTICA Osasco - SP Efetivo | https://redemoura.gupy.io/jobs/11862470
AUXILIAR OPERACIONAL DE LOGÍSTICA Teresina - PI Efetivo | https://redemoura.gupy.io/jobs/12332464
AUXILIAR OPERACIONAL DE LOGÍSTICA - BRASÍLIA/DF Distrito Federal - DF Efetivo | https://redemoura.gupy.io/jobs/11967059
AUXILIAR OPERACIONAL DE LOGÍSTICA - BRASÍLIA/DF Distrito Federal - DF Efetivo | https://redemoura.gupy.io/jobs/12478968
AUXILIAR OPERACIONAL DE LOGÍSTICA - SANTARÉM/PA Santarém - PA Efetivo | https://redemoura.gupy.io/jobs/11406437
AUXILIAR OPERACIONAL DE LOGÍSTICA - SANTARÉM/PA Santarém - PA Banco de talentos | https://redemoura.gupy.io/jobs/12160920
AUXILIAR OPERACIONAL DE LOGÍSTICA - SÃO LUÍS/MA São Luís - MA Efetivo | https://redemoura.gupy.io/jobs/11891191
AUXILIAR OPERACIONAL DE LOGÍSTICA - SÃO LUÍS/MA São Luís - MA Efetivo | https://redemoura.gupy.io/jobs/12516117
AUXILIAR OPERACIONAL DE LOGÍSTICA | ARACAJU - SE Aracaju - SE Efetivo | https://redemoura.gupy.io/jobs/11232615
AUXILIAR OPERACIONAL DE LOGÍSTICA | ARACAJU - SE Aracaju - SE Banco de talentos | https://redemoura.gupy.io/jobs/12426530
AUXILIAR OPERACIONAL DE LOGÍSTICA | NATAL - RN Natal - RN Efetivo | https://redemoura.gupy.io/jobs/12315334
AUXILIAR OPERACIONAL DE LOGÍSTICA | TERESINA - PI Teresina - PI Efetivo | https://redemoura.gupy.io/jobs/12398605
AUXILIAR OPERACIONAL DE LOGÍSTICA | VITÓRIA DA CONQUISTA - BA São Carlos - SP Efetivo | https://redemoura.gupy.io/jobs/11967180
AUXILIAR TECNICO - GSB CASAS BAHIA (JUNDIAI) Jundiaí - SP Efetivo | https://grupomoura.gupy.io/jobs/11887991
AUXILIAR TECNICO - GSB HYUNDAI (PIRACICABA) Piracicaba - SP Efetivo | https://grupomoura.gupy.io/jobs/12303309
AUXILIAR TÉCNICO - RSM PR São José dos Pinhais - PR Efetivo | https://grupomoura.gupy.io/jobs/12090738
AUXILIAR TÉCNICO - RSM PR Curitiba - PR Efetivo | https://grupomoura.gupy.io/jobs/11889690
AUXILIAR TÉCNICO - RSM PR Curitiba - PR Efetivo | https://grupomoura.gupy.io/jobs/12057615
AUXILIAR TÉCNICO - RSM PR Ponta Grossa - PR Efetivo | https://grupomoura.gupy.io/jobs/12057673
AUXILIAR TÉCNICO - RSM PR São José dos Pinhais - PR Efetivo | https://grupomoura.gupy.io/jobs/12336418
AUXILIAR TÉCNICO - RSM PR Ponta Grossa - PR Efetivo | https://grupomoura.gupy.io/jobs/12407309
AUXILIAR TECNICO - RSM SP SAMSUNG (CAJAMAR) Cajamar - SP Efetivo | https://grupomoura.gupy.io/jobs/11954126
BANCO DE TALENTO| VENDEDOR(A) EXTERNO - SÃO JOSÉ DO RIO PRETO/SP São José do Rio Preto - SP Banco de talentos | https://redemoura.gupy.io/jobs/11413433
BANCO DE TALENTOS Porto Velho - RO Banco de talentos | https://redemoura.gupy.io/jobs/10207420
BANCO DE TALENTOS - ESTÁGIO EM LAURO DE FREITAS/BA Lauro de Freitas - BA Banco de talentos | https://grupomoura.gupy.io/jobs/10450336
BANCO DE TALENTOS - MOTORISTA - CACHOEIRO / ES Cachoeiro de Itapemirim - ES Banco de talentos | https://redemoura.gupy.io/jobs/12434001
BANCO DE TALENTOS - MOTORISTA ENTREGADOR - CASCAVEL /PR Banco de talentos | https://redemoura.gupy.io/jobs/11659424
BANCO DE TALENTOS - MOTORISTA ENTREGADOR - LONDRINA /PR Londrina - PR Banco de talentos | https://redemoura.gupy.io/jobs/11120127
BANCO DE TALENTOS - MOTORISTA ENTREGADOR - LONDRINA/PR Londrina - PR Banco de talentos | https://redemoura.gupy.io/jobs/11120081
BANCO DE TALENTOS - VENDEDOR EXTERNO | ZONA LESTE DE SÃO PAULO São Paulo - SP Banco de talentos | https://redemoura.gupy.io/jobs/8523272
BANCO DE TALENTOS - VENDEDOR(A) EXTERNO(A) - SÃO CARLOS/SP São Carlos - SP Banco de talentos | https://redemoura.gupy.io/jobs/12506943
BANCO DE TALENTOS - VENDEDOR(A) EXTERNO(A) | CASCAVEL/PR Cascavel - PR Banco de talentos | https://redemoura.gupy.io/jobs/12262347
BANCO DE TALENTOS | AUXILIAR DE ENTREGA - GOVERNADOR VALADARES / MG (CNH B) Governador Valadares - MG Banco de talentos | https://redemoura.gupy.io/jobs/11841490
BANCO DE TALENTOS | AUXILIAR DE ENTREGAS/LOGÍSTICA - PATOS DE MINAS/MG Patos de Minas - MG Banco de talentos | https://redemoura.gupy.io/jobs/11611213
BANCO DE TALENTOS | AUXILIAR DE ENTREGAS/LOGÍSTICA - PATOS DE MINAS/MG Patos de Minas - MG Banco de talentos | https://redemoura.gupy.io/jobs/12454746
BANCO DE TALENTOS | AUXILIAR DE LOGÍSTICA - MONTES CLAROS/MG Montes Claros - MG Banco de talentos | https://redemoura.gupy.io/jobs/11841879
BANCO DE TALENTOS | AUXILIAR DE LOGÍSTICA - MONTES CLAROS/MG Montes Claros - MG Banco de talentos | https://redemoura.gupy.io/jobs/11969678
BANCO DE TALENTOS | AUXILIAR OPERACIONAL DE LOGÍSTICA/ENTREGA Ribeirão Preto - SP Banco de talentos | https://redemoura.gupy.io/jobs/10316172
BANCO DE TALENTOS | ESTÁGIO - LINHARES/ES Linhares - ES Banco de talentos | https://redemoura.gupy.io/jobs/7828877
BANCO DE TALENTOS | ESTÁGIO COMERCIAL - MONTES CLAROS/MG Montes Claros - MG Banco de talentos | https://redemoura.gupy.io/jobs/12491475
BANCO DE TALENTOS | ESTOQUISTA - LINHARES/ES Linhares - ES Banco de talentos | https://redemoura.gupy.io/jobs/7828726
BANCO DE TALENTOS | MOTORISTA ENTREGADOR - UBERLÂNDIA/MG Uberlândia - MG Banco de talentos | https://redemoura.gupy.io/jobs/11136570
BANCO DE TALENTOS | SUPERVISOR DE VENDAS | SÃO PAULO Parque Novo Mundo - SP Banco de talentos | https://redemoura.gupy.io/jobs/8566171
BANCO DE TALENTOS | VENDEDOR BATERIA DE MOTO - GOVERNADOR VALADARES/MG Governador Valadares - MG Banco de talentos | https://redemoura.gupy.io/jobs/12288058
BANCO DE TALENTOS | VENDEDOR TRAINEE EXTERNO - PATOS DE MINAS/MG Patos de Minas - MG Banco de talentos | https://redemoura.gupy.io/jobs/12260848
BANCO DE TALENTOS | VENDEDOR(A) CORPORATIVO - LINHARES/ES Linhares - ES Banco de talentos | https://redemoura.gupy.io/jobs/7828975
BANCO DE TALENTOS | VENDEDOR(A) EXTERNO(A) - LINHARES/ES Linhares - ES Banco de talentos | https://redemoura.gupy.io/jobs/7828790
BANCO DE TALENTOS | VENDEDOR(A) EXTERNO(A) - LINHARES/ES Linhares - ES Banco de talentos | https://redemoura.gupy.io/jobs/12162408
BANCO DE TALENTOS | VENDEDOR(A) EXTERNO(A) TRAINEE Ribeirão Preto - SP Banco de talentos | https://redemoura.gupy.io/jobs/10230458
BANCO DE TALENTOS VENDEDORAS | VAGA AFIRMATIVA PARA MULHERES Uberlândia - MG Banco de talentos | https://redemoura.gupy.io/jobs/8454048
BANCO DE TALENTOS VENDEDORAS | VAGA AFIRMATIVA PARA MULHERES Parque Novo Mundo - SP Banco de talentos | https://redemoura.gupy.io/jobs/8454062
TÉCNICO(A) EM MANUTENÇÃO ELÉTRICA I Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/12215509
TÉCNICO(A) EM MANUTENÇÃO MECÂNICA Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11611196
TÉCNICO(A) EM SEGURANÇA DO TRABALHO Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/10967840
TÉCNICO(A) EM SEGURANÇA DO TRABALHO Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11922174
VENDEDOR Osasco - SP Efetivo | https://redemoura.gupy.io/jobs/12343166
VENDEDOR - CAXIAS DO SUL Caxias do Sul - RS Efetivo | https://redemoura.gupy.io/jobs/11660407
VENDEDOR (A) EXTERNO (A) | (JUINA OU JUARA - MT) Sinop - MT Efetivo | https://redemoura.gupy.io/jobs/12058146
VENDEDOR (A) EXTERNO (A) | BARBALHA - CE Barbalha - CE Efetivo | https://redemoura.gupy.io/jobs/11545006
VENDEDOR (A) EXTERNO (A) | BARBALHA - CE Barbalha - CE Efetivo | https://redemoura.gupy.io/jobs/12532695
VENDEDOR (A) EXTERNO (A) JR | ANÁPOLIS - GO Anápolis - GO Efetivo | https://redemoura.gupy.io/jobs/11498839
VENDEDOR (A) TRAINEE (FERISTA) | GOIÂNIA - GO Goiânia - GO Efetivo | https://redemoura.gupy.io/jobs/11215571
VENDEDOR (A) TRAINEE (FERISTA) | GOIÂNIA - GO Goiânia - GO Efetivo | https://redemoura.gupy.io/jobs/12433030
VENDEDOR (UBÁ) Ubá - MG Efetivo | https://redemoura.gupy.io/jobs/12186977
VENDEDOR (VIÇOSA) Viçosa - MG Efetivo | https://redemoura.gupy.io/jobs/12187158
VENDEDOR BATERIA DE MOTO - GOVERNADOR VALADARES/MG Governador Valadares - MG Efetivo | https://redemoura.gupy.io/jobs/11258011
VENDEDOR BATERIA DE MOTO - GOVERNADOR VALADARES/MG Governador Valadares - MG Efetivo | https://redemoura.gupy.io/jobs/11611289
VENDEDOR EXTERNO Palmas - TO Efetivo | https://redemoura.gupy.io/jobs/11477163
VENDEDOR EXTERNO Manaus - AM Efetivo | https://redemoura.gupy.io/jobs/11742650
VENDEDOR EXTERNO Diadema - SP Efetivo | https://redemoura.gupy.io/jobs/12146141
VENDEDOR EXTERNO - PASSO FUNDO/RS Passo Fundo - RS Efetivo | https://redemoura.gupy.io/jobs/11315957
VENDEDOR EXTERNO - PELOTAS / RS Pelotas - RS Efetivo | https://redemoura.gupy.io/jobs/10847221
VENDEDOR EXTERNO - PORTO ALEGRE Porto Alegre - RS Efetivo | https://redemoura.gupy.io/jobs/11881319
VENDEDOR EXTERNO - REGIÃO DE IJUÍ/RS Passo Fundo - RS Efetivo | https://redemoura.gupy.io/jobs/11315986
VENDEDOR EXTERNO - SANTA MARIA E REGIÃO/RS Santa Maria - RS Efetivo | https://redemoura.gupy.io/jobs/11588716
VENDEDOR EXTERNO (JUIZ DE FORA) Juiz de Fora - MG Efetivo | https://redemoura.gupy.io/jobs/12419147
VENDEDOR EXTERNO (PONTE NOVA) Ponte Nova - MG Efetivo | https://redemoura.gupy.io/jobs/12187222
VENDEDOR EXTERNO | PALMAS - TO Palmas - TO Efetivo | https://redemoura.gupy.io/jobs/11598776
VENDEDOR EXTERNO CORPORATIVO Porto Velho - RO Efetivo | https://redemoura.gupy.io/jobs/11466606
VENDEDOR(A) - GOVERNADOR VALADARES/MG Governador Valadares - MG Efetivo | https://redemoura.gupy.io/jobs/11990227
VENDEDOR(A) - RSM BA Lauro de Freitas - BA Efetivo | https://grupomoura.gupy.io/jobs/12284001
VENDEDOR(A) CORPORATIVO | MACEIÓ-AL Maceió - AL Efetivo | https://redemoura.gupy.io/jobs/11646207
VENDEDOR(A) EXTERNO | ARAPIRACA - AL Arapiraca - AL Efetivo | https://redemoura.gupy.io/jobs/9937841
VENDEDOR(A) EXTERNO(A) - ATUAÇÃO REGIÃO VALE DO IVAÍ Arapongas - PR Efetivo | https://redemoura.gupy.io/jobs/10730084
VENDEDOR(A) EXTERNO(A) - JAÚ/SP Jaú - SP Efetivo | https://redemoura.gupy.io/jobs/11087445
VENDEDOR(A) EXTERNO(A) - LINHARES/ES Linhares - ES Efetivo | https://redemoura.gupy.io/jobs/12434697
VENDEDOR(A) EXTERNO(A) | CASCAVEL/PR E REGIÃO Cascavel - PR Efetivo | https://redemoura.gupy.io/jobs/12442568
VENDEDOR(A) EXTERNO(A) | CURITIBA/PR E REGIÃO Curitiba - PR Efetivo | https://redemoura.gupy.io/jobs/12329906
VENDEDOR(A) EXTERNO(A) | REGIÃO NORTE E VALE DO ITAJAÍ - SC Jaraguá do Sul - SC Efetivo | https://redemoura.gupy.io/jobs/12078201
VENDEDOR(A) EXTERNO(A) | REGIÃO NORTE E VALE DO ITAJAÍ - SC São Bento do Sul - SC Efetivo | https://redemoura.gupy.io/jobs/12078607
VENDEDOR(A) EXTERNO(A) | REGIÃO NORTE E VALE DO ITAJAÍ - SC Itapoá - SC Efetivo | https://redemoura.gupy.io/jobs/12078701
VENDEDOR(A) EXTERNO(A) FERISTA - UMUARAMA E REGIÃO Umuarama - PR Efetivo | https://redemoura.gupy.io/jobs/11943869
VENDEDOR(A) TRAINEE - TERESINA | PI Teresina - PI Efetivo | https://redemoura.gupy.io/jobs/12216132
VENDEDOR(A) TRAINEE - UBERLÂNDIA/MG Uberlândia - MG Efetivo | https://redemoura.gupy.io/jobs/11984950
VENDEDOR(A) TRAINEE | ANÁPOLIS - GO Anápolis - GO Efetivo | https://redemoura.gupy.io/jobs/12532210
VENDEDOR(A) TRAINEE | MACEIÓ - AL Maceió - AL Efetivo | https://redemoura.gupy.io/jobs/11284735
VENDEDOR(A) TRAINEE | MACEIÓ - AL Maceió - AL Efetivo | https://redemoura.gupy.io/jobs/12459981
VENDEDOR(A) TRAINEE | MOSSORÓ - RN Natal - RN Efetivo | https://redemoura.gupy.io/jobs/11648387
VENDEDOR(A) TRAINEE | MOSSORÓ - RN Natal - RN Efetivo | https://redemoura.gupy.io/jobs/12532226
VENDEDOR(A) TRAINEE | RECIFE - PE Recife - PE Efetivo | https://redemoura.gupy.io/jobs/11503892
VENDEDOR(A) TRAINEE | RECIFE - PE Recife - PE Efetivo | https://redemoura.gupy.io/jobs/12426348
VENDEDORA EXTERNA - SÃO CARLOS/SP São Carlos - SP Efetivo | https://redemoura.gupy.io/jobs/11731263
VENDEDORA TRAINEE EXTERNA - UBERLÂNDIA/MG (VAGA AFIRMATIVA PARA MULHERES) Uberlândia - MG Efetivo | https://redemoura.gupy.io/jobs/12206353
JOVEM APRENDIZ | ADMINISTRATIVO FINANCEIRO Fortaleza - CE Aprendiz | https://redemoura.gupy.io/jobs/12417212
JOVEM APRENDIZ | BARBALHA-CE Barbalha - CE Estágio | https://redemoura.gupy.io/jobs/11972848
JOVEM APRENDIZ ADMINISTRATIVO Recife - PE Aprendiz | https://redemoura.gupy.io/jobs/9666602
JOVEM APRENDIZ ADMINISTRATIVO Recife - PE Aprendiz | https://redemoura.gupy.io/jobs/12419625
JOVEM APRENDIZ EM ASSISTÊNCIA TÉCNICA | RECIFE - PE Recife - PE Estágio | https://redemoura.gupy.io/jobs/11517120
JOVEM APRENDIZ EM ASSISTÊNCIA TÉCNICA | RECIFE - PE Recife - PE Estágio | https://redemoura.gupy.io/jobs/12301515
LÍDER DE MANUTENÇÃO MECÂNICA Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11611264
LÍDER DE MOVIMENTAÇÃO Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11014161
LÍDER TÉCNICO - RSM PR São José dos Pinhais - PR Efetivo | https://grupomoura.gupy.io/jobs/12054895
MOTORISTA Diadema - SP Efetivo | https://redemoura.gupy.io/jobs/11708153
MOTORISTA Piracicaba - SP Efetivo | https://redemoura.gupy.io/jobs/12072529
MOTORISTA - ATENDIMENTO LINHARES E REGIÃO Sooretama - ES Efetivo | https://redemoura.gupy.io/jobs/11569593
MOTORISTA - CAXIAS DO SUL Caxias do Sul - RS Efetivo | https://redemoura.gupy.io/jobs/10850947
MOTORISTA - CAXIAS DO SUL Porto Alegre - RS Efetivo | https://redemoura.gupy.io/jobs/11603413
MOTORISTA - PORTO ALEGRE Porto Alegre - RS Efetivo | https://redemoura.gupy.io/jobs/11144165
MOTORISTA - PORTO ALEGRE Porto Alegre - RS Efetivo | https://redemoura.gupy.io/jobs/11513952
MOTORISTA | CAMPOS DOS GOYTACAZES - RJ Campos dos Goytacazes - RJ Efetivo | https://redemoura.gupy.io/jobs/11426879
MOTORISTA | CAMPOS DOS GOYTACAZES - RJ Campos dos Goytacazes - RJ Banco de talentos | https://redemoura.gupy.io/jobs/11602381
MOTORISTA | CAMPOS DOS GOYTACAZES - RJ Campos dos Goytacazes - RJ Banco de talentos | https://redemoura.gupy.io/jobs/11781324
MOTORISTA | CAMPOS DOS GOYTACAZES - RJ Campos dos Goytacazes - RJ Banco de talentos | https://redemoura.gupy.io/jobs/12201826
MOTORISTA | LAURO DE FREITAS - BA Lauro de Freitas - BA Banco de talentos | https://redemoura.gupy.io/jobs/11585175
MOTORISTA | SÃO PAULO/SP São Paulo - SP Efetivo | https://redemoura.gupy.io/jobs/12437299
MOTORISTA CARRETEIRO | GRUPO MOURA Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11433903
MOTORISTA DE ENTREGA | SÃO LUÍS São Luís - MA Efetivo | https://redemoura.gupy.io/jobs/12456631
MOTORISTA ENTREGADOR - BELO HORIZONTE/MG Belo Horizonte - MG Efetivo | https://redemoura.gupy.io/jobs/11529108
MOTORISTA ENTREGADOR - BELO HORIZONTE/MG Belo Horizonte - MG Efetivo | https://redemoura.gupy.io/jobs/12396094
MOTORISTA ENTREGADOR - PARACATU/MG (CNH D OU E) Montes Claros - MG Efetivo | https://redemoura.gupy.io/jobs/12055346
MOTORISTA ENTREGADOR - PATOS DE MINAS/MG Patos de Minas - MG Efetivo | https://redemoura.gupy.io/jobs/12316783
MOTORISTA ENTREGADOR - SÃO JOSÉ DOS CAMPOS/SP São José dos Campos - SP Efetivo | https://redemoura.gupy.io/jobs/12288012
MOTORISTA ENTREGADOR (CATEGORIA D) | ANÁPOLIS - GO Anápolis - GO Efetivo | https://redemoura.gupy.io/jobs/11532291
MOTORISTA ENTREGADOR (CATEGORIA D) | ANÁPOLIS/GO Anápolis - GO Efetivo | https://redemoura.gupy.io/jobs/12060299
MOTORISTA ENTREGADOR | CHAPECÓ / SC Chapecó - SC Efetivo | https://redemoura.gupy.io/jobs/12492219
MOTORISTA ENTREGADOR | GOIÂNIA-GO Goiânia - GO Efetivo | https://redemoura.gupy.io/jobs/11726793
OPERADOR(A) DE LOGÍSTICA Guarulhos - SP Efetivo | https://grupomoura.gupy.io/jobs/11498028
SECRETARIA EXECUTIVA Recife - PE Efetivo | https://redemoura.gupy.io/jobs/10397457
SUPERVISÃO ADMINISTRATIVO FINANCEIRO | MACEIÓ - AL Maceió - AL Efetivo | https://redemoura.gupy.io/jobs/11930375
SUPERVISÃO DE LOGÍSTICA - LONDRINA/PR Londrina - PR Efetivo | https://redemoura.gupy.io/jobs/11560481
SUPERVISÃO DE LOGÍSTICA - RIBEIRÃO PRETO/SP Ribeirão Preto - SP Efetivo | https://redemoura.gupy.io/jobs/11976369
SUPERVISÃO DE VENDAS - MARINGÁ/PR Maringá - PR Efetivo | https://redemoura.gupy.io/jobs/11445915
SUPERVISÃO DE VENDAS (CORPORATIVO E MOTO) | CUIABÁ - MT Cuiabá - MT Efetivo | https://redemoura.gupy.io/jobs/11929811
SUPERVISÃO DE VENDAS (CORPORATIVO E MOTO) | CUIABÁ - MT Cuiabá - MT Efetivo | https://redemoura.gupy.io/jobs/12446327
SUPERVISOR (A) DE VENDAS | SINOP - MT Sinop - MT Efetivo | https://redemoura.gupy.io/jobs/11824330
SUPERVISOR (A) DE VENDAS | SINOP - MT Sinop - MT Efetivo | https://redemoura.gupy.io/jobs/12432895
SUPERVISOR ADM FINANCEIRO - RM Manaus - AM Efetivo | https://redemoura.gupy.io/jobs/11532320
SUPERVISOR DE LOGÍSTICA | SÃO LUÍS - MA São Luís - MA Efetivo | https://redemoura.gupy.io/jobs/12040013
SUPERVISOR DE VENDAS São Paulo - SP Efetivo | https://redemoura.gupy.io/jobs/11748448
TÉCNICO DE GARANTIA Itapetininga - SP Efetivo | https://grupomoura.gupy.io/jobs/12046403
TÉCNICO EM PRODUTO Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11439777
TÉCNICO(A) DE MANUTENÇÃO ELÉTRICA II Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11611250
TÉCNICO(A) DE MANUTENÇÃO MECÂNICA Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11666222
CONSULTOR DE GESTÃO FINANCEIRA (PROJETOS E NOVOS NEGÓCIOS) | RECIFE -PE Recife - PE Efetivo | https://redemoura.gupy.io/jobs/12439348
CONSULTOR(A) COMERCIAL DE RENTABILIDADE PL | BESS Jaboatão dos Guararapes - PE Efetivo | https://grupomoura.gupy.io/jobs/11765507
CONSULTOR(A) COMERCIAL DE RENTABILIDADE PL | LÍTIO AUTOMOTIVO Jaboatão dos Guararapes - PE Efetivo | https://grupomoura.gupy.io/jobs/11765052
CONSULTOR(A) DE DESENVOLVIMENTO ORGANIZACIONAL (PROJETOS) - RECIFE/PE Recife - PE Efetivo | https://redemoura.gupy.io/jobs/11434283
CONSULTOR(A) DE GESTÃO DE PESSOAS (BUSINESS PARTNER) | SALVADOR - BA Lauro de Freitas - BA Efetivo | https://redemoura.gupy.io/jobs/11829594
CONSULTOR(A) DE NEGÓCIOS CORPORATIVOS - SÃO PAULO/SP São Paulo - SP Efetivo | https://redemoura.gupy.io/jobs/12436182
CONSULTOR(A) DE NEGÓCIOS SR | PRÉ-VENDA LÍTIO AUTOMOTIVO Jaboatão dos Guararapes - PE Efetivo | https://grupomoura.gupy.io/jobs/11852534
CONSULTOR(A) DE PRODUTOS Jaboatão dos Guararapes - PE Efetivo | https://grupomoura.gupy.io/jobs/12418291
CONSULTOR(A) DE SISTEMAS PL Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/12417086
CONSULTOR(A) PERFORMANCE COMERCIAL E TRADE MARKETING Recife - PE Efetivo | https://redemoura.gupy.io/jobs/11600666
COORDENAÇÃO DE SISTEMAS Recife - PE Efetivo | https://grupomoura.gupy.io/jobs/12414684
ENCARREGADO DE LOGÍSTICA Taboão da Serra - SP Efetivo | https://redemoura.gupy.io/jobs/11892746
ENCARREGADO DE LOGÍSTICA São Paulo - SP Efetivo | https://redemoura.gupy.io/jobs/11893880
ENCARREGADO DE LOGÍSTICA Osasco - SP Efetivo | https://redemoura.gupy.io/jobs/11894134
ENCARREGADO DE LOGÍSTICA Osasco - SP Efetivo | https://redemoura.gupy.io/jobs/12342519
ESTAGIÁRIO ASSISTÊNCIA TÉCNICA Porto Velho - RO Estágio | https://redemoura.gupy.io/jobs/11893129
ESTAGIÁRIO COMERCIAL Barueri - SP Estágio | https://grupomoura.gupy.io/jobs/11544808
ESTAGIÁRIO TÉCNICO EM SEGURANÇA DO TRABALHO Itapetininga - SP Estágio | https://grupomoura.gupy.io/jobs/11710249
ESTÁGIO - BAURU/SP Bauru - SP Estágio | https://redemoura.gupy.io/jobs/11243201
ESTÁGIO - MONTES CLAROS/MG Montes Claros - MG Estágio | https://redemoura.gupy.io/jobs/11989226
ESTÁGIO - SANTARÉM/PA Santarém - PA Estágio | https://redemoura.gupy.io/jobs/12398600
ESTÁGIO ADMINISTRATIVO - CHAPECÓ/SC Chapecó - SC Estágio | https://redemoura.gupy.io/jobs/12334535
ESTÁGIO ADMINISTRATIVO FINANCEIRO | FORTALEZA - CE Fortaleza - CE Estágio | https://redemoura.gupy.io/jobs/11748104
ESTÁGIO ADMINISTRATIVO FINANCEIRO | TERESINA - PI Teresina - PI Estágio | https://redemoura.gupy.io/jobs/12054732
ESTÁGIO ANÁLISE DE DADOS / COMERCIAL - RIBEIRÃO PRETO Ribeirão Preto - SP Estágio | https://redemoura.gupy.io/jobs/11969443
ESTÁGIO COMERCIAL - MONTES CLAROS/MG Montes Claros - MG Estágio | https://redemoura.gupy.io/jobs/11858598
ESTÁGIO DE ATENDIMENTO - MONTES CLAROS/MG Montes Claros - MG Estágio | https://redemoura.gupy.io/jobs/11662415
ESTÁGIO DE GESTÃO DA INFORMAÇÃO Diadema - SP Estágio | https://redemoura.gupy.io/jobs/12196710
ESTÁGIO EM ADMINISTRAÇÃO Belo Jardim - PE Estágio | https://grupomoura.gupy.io/jobs/11609747
ESTÁGIO EM ADMINISTRAÇÃO OU CIÊNCIA CONTÁBEIS Belo Jardim - PE Estágio | https://grupomoura.gupy.io/jobs/11600246
ESTÁGIO EM ATRAÇÃO E SELEÇÃO | RECIFE - PE Recife - PE Estágio | https://redemoura.gupy.io/jobs/11707207
ESTÁGIO EM ENGENHARIA Belo Jardim - PE Estágio | https://grupomoura.gupy.io/jobs/11496349
ESTÁGIO EM INTELIGÊNCIA ARTIFICIAL Recife - PE Estágio | https://grupomoura.gupy.io/jobs/11618408
ESTAGIO EM RESPONSABILIDADE SOCIAL (PROJETOS SOCIOAMBIENTAIS) Belo Jardim - PE Estágio | https://grupomoura.gupy.io/jobs/11319937
ESTÁGIO FINANCEIRO (ADQUIRÊNCIA FINANCEIRA) | RECIFE - PE Recife - PE Estágio | https://redemoura.gupy.io/jobs/11970515
ESTÁGIO TÉCNICO Itapetininga - SP Estágio | https://grupomoura.gupy.io/jobs/11639724
ESTÁGIO TÉCNICO EM ELETROTÉCNICA/MECATRÔNICA Belo Jardim - PE Efetivo | https://grupomoura.gupy.io/jobs/11242174
ESTAGIO TÉCNICO EM SEGURANÇA DO TRABALHO Belo Jardim - PE Estágio | https://grupomoura.gupy.io/jobs/11184759
EXECUTIVO(A) DE CONTAS (BESS) | SÃO PAULO - SP São Paulo - SP Efetivo | https://redemoura.gupy.io/jobs/12465596
EXECUTIVO(A) DE CONTAS | SEGMENTO DE ENERGIA São Paulo - SP Efetivo | https://grupomoura.gupy.io/jobs/11730284
EXECUTIVO(A) DE CONTAS | TELECOM São Paulo - SP Efetivo | https://grupomoura.gupy.io/jobs/11844686
JOVEM APRENDIZ São Paulo - SP Aprendiz | https://redemoura.gupy.io/jobs/11614587
JOVEM APRENDIZ São Paulo - SP Aprendiz | https://redemoura.gupy.io/jobs/11929073
JOVEM APRENDIZ Cuiabá - MT Estágio | https://redemoura.gupy.io/jobs/12384508
JOVEM APRENDIZ _ LOGÍSTICA Diadema - SP Aprendiz | https://redemoura.gupy.io/jobs/12142673
JOVEM APRENDIZ - PASSO FUNDO/RS Passo Fundo - RS Aprendiz | https://redemoura.gupy.io/jobs/11923571
JOVEM APRENDIZ - SANTA MARIA/RS Santa Maria - RS Estágio | https://redemoura.gupy.io/jobs/11923666
JOVEM APRENDIZ (ÁREAS ADMINISTRATIVAS) Recife - PE Banco de talentos | https://redemoura.gupy.io/jobs/9768333
JOVEM APRENDIZ (EXPERIÊNCIA DO CLIENTE) Recife - PE Aprendiz | https://redemoura.gupy.io/jobs/11741936
JOVEM APRENDIZ (LOGÍSTICA) | BRASÍLIA-DF Brasília - DF Estágio | https://redemoura.gupy.io/jobs/11550512
`;
