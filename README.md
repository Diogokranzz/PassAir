# PassAir

O PassAir é uma aplicação moderna desenvolvida para rastrear voos em tempo real, oferecendo aos usuários informações detalhadas sobre partidas, chegadas e especificidades das aeronaves. O projeto foi construído com foco na experiência do usuário, desempenho e qualidade visual.

## O Processo de Desenvolvimento

O desenvolvimento começou com o objetivo de criar uma interface fluida que pudesse consumir dados em tempo real. Iniciamos configurando o frontend com Next.js para garantir uma aplicação rápida e responsiva. Conforme o projeto evoluiu, integramos um backend em Python para interagir com a API do FlightRadar24, permitindo buscar dados precisos de voo.

Uma parte significativa do desenvolvimento foi dedicada à otimização de desempenho. Inicialmente, a busca por imagens de aeronaves era lenta devido à necessidade de verificar múltiplos voos para encontrar uma foto válida. Superamos isso implementando uma estratégia de busca paralela, que reduziu drasticamente os tempos de carregamento. Também implementamos Renderização no Lado do Servidor (SSR) para o carregamento inicial de dados, garantindo que os usuários vejam informações de voo imediatamente ao abrir o aplicativo.

## Linguagens e Tecnologias Utilizadas

O projeto utiliza um conjunto robusto de tecnologias modernas:

*   **TypeScript e React (Next.js)**: Para o frontend, proporcionando segurança de tipos e uma arquitetura baseada em componentes.
*   **Tailwind CSS**: Para estilização, permitindo um design personalizado e responsivo.
*   **Python**: Para a lógica de backend, especificamente para interagir com APIs de dados de voo externos e processar estruturas de dados complexas.

## Desafios Encontrados

Um dos principais desafios foi lidar com a inconsistência de dados externos. Frequentemente, imagens de aeronaves ou detalhes específicos de voo estavam ausentes. Para resolver isso, criamos uma estratégia inteligente que busca imagens alternativas da mesma companhia aérea ou modelo de aeronave, garantindo uma experiência visual rica mesmo quando os dados são escassos.

Outro desafio foi garantir que a aplicação permanecesse responsiva durante a busca de dados pesados. Resolvemos isso implementando estados de carregamento claros e otimizando nossas chamadas de API. Também focamos na qualidade do código, mantendo uma base limpa e profissional.
