-- Même lacune que 0004 : `clients` n'avait qu'une policy SELECT pour le client
-- lui-même ("client_read_own"). Sans policy UPDATE, l'espace client → Mon
-- profil échouerait silencieusement (0 ligne affectée, 204 quand même).

create policy "client_update_own" on clients for update using (id = auth_client_id());
