-- etab
alter table etabs add constraint etabs_unique1 unique (et_nom);
alter table etabs add constraint etabs_check1 check (et_type in ('pu','pv'));
alter table etabs add constraint etabs_unique3 unique (et_tel);
-- user
alter table users add constraint users_unique1 unique(us_prenom,us_nom,et_id);
alter table users add constraint users_check1 check (us_role in ('admin','dir','sur','com'));
alter table users add constraint users_check2 check (us_sexe in ('h','f'));
alter table users add constraint users_unique2 unique(us_tel);
alter table users add constraint users_fkey1 foreign key (et_id) references etabs(et_id);
-- ascolaire
alter table ascolaires add constraint ascolaires_unique1 unique(as_d,as_f,et_id);
alter table ascolaires add constraint ascolaires_check1 check (as_d < as_f);
alter table ascolaires add constraint ascolaires_check2 check ((as_f - as_d)::int >= 248); -- au moins pour avoir une année scolaire
alter table ascolaires add constraint ascolaires_fkey1 foreign key (et_id) references etabs (et_id) on update cascade on delete cascade;
-- eleves
alter table eleves add constraint eleves_unique1 unique (el_prenom,el_nom);
alter table eleves add constraint eleves_unique2 unique (el_mat);
alter table eleves add constraint eleves_check1 check (el_sexe in ('g','f'));
alter table eleves add constraint eleves_check2 check (el_type in ('pu','pv'));
alter table eleves add constraint eleves_check3 check (date_naiss < now()::date);
alter table eleves add constraint eleves_fkey1 foreign key (et_id) references etabs (et_id) on update cascade on delete cascade;
-- series
alter table series add constraint series_unique1 unique (se_nom);
alter table series add constraint series_unique2 unique (se_nomab);
alter table series add constraint series_check1 check (se_niveau in (10,11,12));
-- etabseries
alter table etabseries add constraint etabseries_check1 check (es_etat in ('0','1'));
alter table etabseries add constraint etabseries_unique1 unique (et_id,se_id);
alter table etabseries add constraint etabseries_check2 check (es_frais >= 0);
alter table etabseries add constraint etabseries_check3 check (es_sub >= 0);
alter table etabseries add constraint etabseries_fkey1 foreign key (et_id) references etabs (et_id) on update cascade on delete cascade;
alter table etabseries add constraint etabseries_fkey2 foreign key (se_id) references series (se_id) on update cascade on delete cascade;
-- classes
alter table classes add constraint classes_unique2 unique (et_id,se_id,cl_nom);
alter table classes add constraint classes_fkey1 foreign key (et_id) references etabs(et_id) on update cascade on delete cascade;
alter table classes add constraint classes_fkey2 foreign key (se_id) references series(se_id) on update cascade on delete cascade;
-- inscriptions
alter table inscriptions add constraint inscriptions_unique1 unique (el_id);
alter table inscriptions add constraint inscriptions_fkey1 foreign key (el_id) references eleves (el_id);
alter table inscriptions add constraint inscriptions_fkey2 foreign key (cl_id) references classes (cl_id);
alter table inscriptions add constraint inscriptions_fkey3 foreign key (as_id) references ascolaires (as_id);
-- paiements
alter table paiements add constraint paiements_check1 check(pa_mte >= 0);
alter table paiements add constraint paiements_fkey foreign key (in_id) references inscriptions(in_id) on update cascade on delete cascade;
--- professeurs
alter table professeurs add constraint professeurs_unique1 unique (pr_prenom,pr_nom,et_id);
alter table professeurs add constraint professeurs_unique2 unique (pr_con);
alter table professeurs add constraint professeurs_check1 check (pr_sexe in ('h','f'));
alter table professeurs add constraint professeurs_check2 check (pr_ecivil in ('c','v','m','d'));
alter table professeurs add constraint professeurs_check3 check (pr_sal >= 0 );
alter table professeurs add constraint professeurs_check4 check (pr_type in ('p','v'));
alter table professeurs add constraint professeurs_fkey1 foreign key (et_id) references etabs (et_id) on update cascade on delete cascade;
-- matieres
alter table matieres add constraint matieres_unique1 unique (ma_nom);
alter table matieres add constraint matieres_unique2 unique (ma_nomab);
-- matseries
alter table matseries add constraint matseries_unique1 unique (se_id,ma_id,et_id);
alter table matseries add constraint matseries_check1 check (ms_coef > 0 );
alter table matseries add constraint matseries_fkey1 foreign key (ma_id) references matieres (ma_id) on update cascade on delete cascade;
alter table matseries add constraint matseries_fkey2 foreign key (se_id) references series (se_id) on update cascade on delete cascade;
alter table matseries add constraint matseries_fkey3 foreign key (et_id) references etabs (et_id) on update cascade on delete cascade;
-- reglements
alter table reglements add constraint reglements_unique1 unique(pr_id,mois,annee);
alter table reglements add constraint reglements_check3 check (annee <= extract (year from now()));
alter table reglements add constraint reglements_check4 check (mois <= extract (month from now()));
alter table reglements add constraint reglements_fkey1 foreign key (pr_id) references professeurs (pr_id) on update cascade on delete cascade;
-- notes
alter table notes add constraint notes_fkey1 foreign key (el_id) references eleves (el_id) on update cascade on delete cascade;
alter table notes add constraint notes_fkey2 foreign key (ma_id) references matieres (ma_id) on update cascade on delete cascade;
alter table notes add constraint notes_fkey3 foreign key (as_id) references ascolaires (as_id) on update cascade on delete cascade;
alter table notes add constraint notes_unique1 unique (el_id,ma_id,as_id,periode);
alter table notes add constraint notes_check1 check (periode in ('t1','t2','t3'));
-- cours
alter table cours add constraint cours_unique1 unique(ma_id,pr_id,cl_id);
alter table cours add constraint cours_fkey1 foreign key (pr_id) references professeurs(pr_id) on update cascade on delete cascade;
alter table cours add constraint cours_fkey2 foreign key (ma_id) references matieres(ma_id) on update cascade on delete cascade;
alter table cours add constraint cours_fkey3 foreign key (cl_id) references classes(cl_id) on update cascade on delete cascade;
-- appels
alter table appels add constraint appels_fkey1 foreign key (cl_id) references classes (cl_id) on update cascade on delete cascade;
-- apcontenus
alter table apcontenus add constraint apcontenus_unique1 unique (el_id,ap_id);
alter table apcontenus add constraint apcontenus_fkey1 foreign key (el_id) references eleves(el_id) on update cascade on delete cascade;
alter table apcontenus add constraint apcontenus_fkey2 foreign key (ap_id) references appels(ap_id) on update cascade on delete cascade;

insert into series (se_nom,se_nomab,se_niveau) 
        values      ('10 Commune','10 CG',10),
                    ('11 Lettres','11 L',11),
                    ('11 Science Economique et Social','11 SES',11),
                    ('11 Science','11 S',11),
                    ('Terminale Science Sociale','12 TSS',12),
                    ('Terminale Science Economique','12 TSECO',12),
                    ('Terminale Science Experimentale','12 TSEXP',12),
                    ('Terminale Science Exactes','12 TSE',12),
                    ('Terminale Arts et Lettres ','12 TAL',12),
                    ('Terminale Langues et Lettres ','12 TLL',12);
insert into matieres (ma_nom,ma_nomab) 
            values   ('Geographie','Geo'),
                     ('Histoire','Hist'),
                     ('Histoire-Geographie','Hist-Geo'),
                     ('Biologie','Bio'),
                     ('Physique','Phys'),
                     ('Chimie','Chim'),
                     ('Physique-Chimie','Phys-Chim'),
                     ('Français','Fr'),
                     ('Anglais','An'),
                     ('Allemand','Al'),
                     ('Langue Nationale (Bambara)','Ba'),
                     ('Arabes','Ar'),
                     ('Mathematiques','Maths'),
                     ('Dessin','Des'),
                     ('Musique','Mus'),
                     ('Economie','Eco'),
                     ('Comptabilité','Compta'),
                     ('Mathematiques-Finançière','Maths-Fine'),
                     ('Education Civique et Moral','ECM'),
                     ('Education Physique et Sportif','EPS'),
                     ('Philosophie','Philo'),
                     ('Sociologie','Socio'),
                     ('Droit','Dr'),
                     ('Informatique','Inf'),
                     ('Statistiques','Stats'),
                     ('Conduite','Cond'),
                     ('Geologie','Geol'),
                     ('Technique d''expressions','Texp');
