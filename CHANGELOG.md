# [0.2.0](https://github.com/labcabrera/rmu-react-shared-lib/compare/0.1.4...0.2.0) (2026-11-11)


* feat!: card columns by container width and two-line card titles ([0281cc3](https://github.com/labcabrera/rmu-react-shared-lib/commit/0281cc3fba709c73a5ff0981d24351e270ae4a34))
* feat!: creature npc model and creature stat block (spec 054) ([b3b81c8](https://github.com/labcabrera/rmu-react-shared-lib/commit/b3b81c8e067f632a0a99649125aec545fd8a2236))
* feat!: shared data helpers, single token renewal and code moved from the MFEs ([fa43824](https://github.com/labcabrera/rmu-react-shared-lib/commit/fa438247627cbffcac370185e05081057af1d556))
* feat!: shared pieces for a consistent UI and removal of unused components (spec 066) ([6d58578](https://github.com/labcabrera/rmu-react-shared-lib/commit/6d58578291bdc69c6507b6051cc4249a0d4e64ab))
* feat!: square entity images, one card grid and picker avatars ([d7d65b4](https://github.com/labcabrera/rmu-react-shared-lib/commit/d7d65b4635feb4173c87661ea4bf16c3e087fb2d))
* feat(faction)!: remove the XP of the factions (spec 049) ([b181d1d](https://github.com/labcabrera/rmu-react-shared-lib/commit/b181d1dd2211dfa8b9f065dcedadd3da6ff22c8f))
* feat(strategic)!: faction players, access per entity and tactical game access ([2a20f5d](https://github.com/labcabrera/rmu-react-shared-lib/commit/2a20f5d995171a720a7ab0756676a1a21ff42104))
* refactor!: remove the deprecated selects replaced by entity pickers (spec 046) ([26de414](https://github.com/labcabrera/rmu-react-shared-lib/commit/26de4146d99a3f4c4f05aa873b27ead44651014e))
* refactor!: remove the roll inputs replaced by RollField ([495d336](https://github.com/labcabrera/rmu-react-shared-lib/commit/495d3365eb88b6495a8f3dba9025a82f2fbb90d1))


### Bug Fixes

* add right padding to the difficulty guide ([36f1996](https://github.com/labcabrera/rmu-react-shared-lib/commit/36f1996121db016a22a2f9fad283047207980cca))
* align the treasure law goods types with the 062 apis ([aec414b](https://github.com/labcabrera/rmu-react-shared-lib/commit/aec414bdb3dd00a59bce110d6b6427933edb9500))
* **api:** ledger kinds of treasure, magic items, recharges and gems (spec 067) ([c6448d3](https://github.com/labcabrera/rmu-react-shared-lib/commit/c6448d3297f5333652a93e3f1492d8d0af69a9f3))
* armor slot filter without full suits, which are no longer catalog items ([300965b](https://github.com/labcabrera/rmu-react-shared-lib/commit/300965b24ff8ba67fa62d11f6e98e2d2f4f23573))
* **combat:** name the severity legend apart from the table severities (spec 066) ([12db93c](https://github.com/labcabrera/rmu-react-shared-lib/commit/12db93c76c14721fe1b3875f594529cfc8c83205))
* **dialogs:** close the confirmation with Escape (spec 066) ([2f687cc](https://github.com/labcabrera/rmu-react-shared-lib/commit/2f687cc44398310bd356f73683fcc8e6875d405a))
* **dialogs:** keep the top padding of dialog content under the title ([71b5c80](https://github.com/labcabrera/rmu-react-shared-lib/commit/71b5c808cd803372e1bb16293118151819e6623e))
* gem cards show the value per carat instead of no price (spec 062) ([0f438bc](https://github.com/labcabrera/rmu-react-shared-lib/commit/0f438bc157aea09ad32ea629f025b60e2860b699))
* **i18n:** keep spell texts when there is no i18next instance ([e4562dd](https://github.com/labcabrera/rmu-react-shared-lib/commit/e4562ddc2fb1b9d065e3889486d1ad08e73f9635))
* **item:** export formatPriceFactorValue ([31e8b5d](https://github.com/labcabrera/rmu-react-shared-lib/commit/31e8b5d75a24df851478ed0a1fb26711aecbce1f))
* **item:** load the whole item catalog across pages ([bd1a0a4](https://github.com/labcabrera/rmu-react-shared-lib/commit/bd1a0a4c6d25c21523b2dd04c3d132217ad93889))
* **item:** loose translate function in itemFeatureLines for the MFE copies of i18next (spec 041) ([cd79b48](https://github.com/labcabrera/rmu-react-shared-lib/commit/cd79b483abab78d764215d4f642ecd342128a04c))
* **items:** ignore accents in the inventory search ([7fffdb6](https://github.com/labcabrera/rmu-react-shared-lib/commit/7fffdb6554732cb85789766bf00b88f6ac51c4d4))
* **items:** split the poison and antidote feature chips ([700b746](https://github.com/labcabrera/rmu-react-shared-lib/commit/700b746337ee7a046c660cddc28c7ba66b86138b))
* keep the explanations of reviewed result steps open ([eedcb81](https://github.com/labcabrera/rmu-react-shared-lib/commit/eedcb81eaab4222b60b6930e3531f91dd9126191))
* **layouts:** keep the detail header from covering the content ([23e053a](https://github.com/labcabrera/rmu-react-shared-lib/commit/23e053a99fd0689289bc56e02599afaa6c09f26c))
* **layouts:** keep the hero title whole on phones (spec 066) ([c027607](https://github.com/labcabrera/rmu-react-shared-lib/commit/c02760701f434c7372d6691248e8b1163977fb52))
* load the whole spell list catalog in the skill selector ([a3213df](https://github.com/labcabrera/rmu-react-shared-lib/commit/a3213dfae4b17065f7a7a98be6493cc9c6167778))
* **maneuver:** room for the labels of number modifiers ([b952b40](https://github.com/labcabrera/rmu-react-shared-lib/commit/b952b40962dd595a337d58fadaad4a44bd21c455))
* name base images by their file in the image selector ([22394ee](https://github.com/labcabrera/rmu-react-shared-lib/commit/22394eef8b4adc6d5e14f6759f619fd64a319c6c))
* poison times with 5-second rounds (spec 079, phase 1) ([51e5aea](https://github.com/labcabrera/rmu-react-shared-lib/commit/51e5aeaa094f7bd899f7d6909271291e74015f2e))
* **rolls:** roll breakdown accepts null params from the API ([3e387bd](https://github.com/labcabrera/rmu-react-shared-lib/commit/3e387bd61217244a8b4e13c3bf73fe49c014009f))
* **rule-hint:** hide id params in the rule param list (spec 080, phase 2) ([2320975](https://github.com/labcabrera/rmu-react-shared-lib/commit/2320975001704a0bd9e662c99c3804dccb437b4e))
* **skills:** group character skills by categoryId and keep their names visible ([7d5394e](https://github.com/labcabrera/rmu-react-shared-lib/commit/7d5394ecd565b528f56f97179ea552cb4fac7a45))
* **skills:** sort the skills by their translated name in the current language ([4050dc3](https://github.com/labcabrera/rmu-react-shared-lib/commit/4050dc3261c9ccc72e3106b617c5f61264973d2f))
* **strategic-game:** campaign date helpers take any t function (spec 065) ([2bb1aea](https://github.com/labcabrera/rmu-react-shared-lib/commit/2bb1aea80e42506e7c00804cec83b2f408f2776d))
* **talents:** drop the unknown animal-training skill from Animal Empathy (spec 079, phase 9) ([e8f4e6c](https://github.com/labcabrera/rmu-react-shared-lib/commit/e8f4e6c3c2b7337356eddd490eec9505b82867b6))
* **templates:** side filter panel takes one column of the card grid ([ea2adb0](https://github.com/labcabrera/rmu-react-shared-lib/commit/ea2adb0795f32cdd282390432a1d4122b83740bc))
* theme colors win over the stylesheet of the markdown editor ([c2d255f](https://github.com/labcabrera/rmu-react-shared-lib/commit/c2d255f7452d6e804fc6fdae35bb3e057d3de55e))
* thumbnails also for base images resolved against the assets URI ([0459c8e](https://github.com/labcabrera/rmu-react-shared-lib/commit/0459c8eab20f5375ad93acbab547e8e731773e2e))
* trait prerequisite value accepts the comma separated ids the API sends ([55c20e3](https://github.com/labcabrera/rmu-react-shared-lib/commit/55c20e3a2730dd12f0ff129905f1222313544321))
* translate item names in the inventory list and its search ([4757c51](https://github.com/labcabrera/rmu-react-shared-lib/commit/4757c5113ef1e7506dbbdbe544622b1d03467806))
* translated poison name and rounded times in the poisoning timeline (spec 042) ([a72abaf](https://github.com/labcabrera/rmu-react-shared-lib/commit/a72abaf738e0875834e63558cbb6b348f84f16c0))
* **treasure:** translate the key of a note with a detail (spec 067) ([3614041](https://github.com/labcabrera/rmu-react-shared-lib/commit/36140410c6ced5c813d1992415cbd6dd9bfd2858))


### Features

* access on items and npcs ([e3b341a](https://github.com/labcabrera/rmu-react-shared-lib/commit/e3b341ae2ca6eb0c1a2aadbe2f65b670b1923f38))
* action of a reviewed step in FlowSteps ([e1de0ae](https://github.com/labcabrera/rmu-react-shared-lib/commit/e1de0ae034a17dc5da8b1ddc5c303f65534f08c5))
* add detail panels, maneuver, trait and stat components (spec 012) ([e1fbd96](https://github.com/labcabrera/rmu-react-shared-lib/commit/e1fbd962fe102b73706cf116b504c5d86731a314))
* add ItemModifierChips to show each modifier of an item ([f622cee](https://github.com/labcabrera/rmu-react-shared-lib/commit/f622cee13fe3b4e48f992a656218bf10e7def2ed))
* add owner and missingReference to the character dto ([4a95fae](https://github.com/labcabrera/rmu-react-shared-lib/commit/4a95fae17e90aa08bb5470ec770a4f84822b0d21))
* add RollField and its calculator-like RollPad ([f3e73e9](https://github.com/labcabrera/rmu-react-shared-lib/commit/f3e73e9158149775ea5fce5ffc28393ba3506cf4))
* add the export and import client and the ImportDialog ([a737826](https://github.com/labcabrera/rmu-react-shared-lib/commit/a737826989300aee13396c111acaa7be96daf4b1))
* add the roll model, presets and dice logic ([2f6e4ab](https://github.com/labcabrera/rmu-react-shared-lib/commit/2f6e4ab2f47616b3508b81ede086bf01f23c9d99))
* add the strategic item modifiers, their API and the item condition chip ([9a4bb25](https://github.com/labcabrera/rmu-react-shared-lib/commit/9a4bb2585a83892ff1b2133ffecd90a7e61c2403))
* add the treatment difficulty preview and the spec 022 health fields ([7c287ca](https://github.com/labcabrera/rmu-react-shared-lib/commit/7c287cab1b82870529931cc17773903a21e4ce6e))
* add theme presets, motion, collection views and character sheet components ([6bdf160](https://github.com/labcabrera/rmu-react-shared-lib/commit/6bdf160bf22e9a6be4e1c559b22ddb2e61995b83))
* add theme, app wrapper, data hooks and page templates ([4d04cf8](https://github.com/labcabrera/rmu-react-shared-lib/commit/4d04cf84a43d2b859b2336a066a5f1196853e347))
* alchemy and enchantment projects (spec 064) ([aab32fa](https://github.com/labcabrera/rmu-react-shared-lib/commit/aab32fafc679588c6543aa3ab60e92be8fbf9965))
* **api:** companion trait fields and categories (spec 039) ([84ce17a](https://github.com/labcabrera/rmu-react-shared-lib/commit/84ce17ab9961629b913ab6f8a985e6165f6d922d))
* **api:** healing in combat, fear and morale types (spec 068) ([483ce95](https://github.com/labcabrera/rmu-react-shared-lib/commit/483ce95e3e07b6f33e5f8785f3c5880ceae42431))
* **api:** renew the session once and retry callApi on a 401 ([aaec858](https://github.com/labcabrera/rmu-react-shared-lib/commit/aaec8585f7f581f0f9c7f689f78867940d2afb28))
* **api:** spec 076 development, combat talents and senses contracts ([26c0e47](https://github.com/labcabrera/rmu-react-shared-lib/commit/26c0e47974d1d5234166be0baee26738427b5dc2))
* **api:** whole attack, critical and fumble tables client ([4ee9282](https://github.com/labcabrera/rmu-react-shared-lib/commit/4ee928226609c8c3a8d824bf3f92b6ba82552f6d))
* armor filter with exclusive type and slot tiles without images ([6499ed5](https://github.com/labcabrera/rmu-react-shared-lib/commit/6499ed5f9b8aa117d861797ec35ee02879cc08ff))
* attack size chip and effects (spec 075) ([416c2de](https://github.com/labcabrera/rmu-react-shared-lib/commit/416c2de8d221c6d63efd2a670048d21234a48c4c))
* block B contracts of skill aids, feats of strength and adrenal moves (spec 079, phase 4) ([4783fe9](https://github.com/labcabrera/rmu-react-shared-lib/commit/4783fe95518de2032c29a9442440c9af7a3930ee))
* **character:** realms, power points and known spells (spec 029) ([dd3f8ac](https://github.com/labcabrera/rmu-react-shared-lib/commit/dd3f8ac9191e72e61a8ae88d27d0ab74854e7d5c))
* **characters:** add talent bonus types and resistance tooltip ([e3ad793](https://github.com/labcabrera/rmu-react-shared-lib/commit/e3ad793d8f4ca58ecfc20184e5fc64a00d094e92))
* **characters:** culture, bonus DP and game option types ([d73e8c4](https://github.com/labcabrera/rmu-react-shared-lib/commit/d73e8c487f14847d54ebcdf45c4be69bbaba3635))
* coated chip in the item inventory (spec 042) ([5cb472c](https://github.com/labcabrera/rmu-react-shared-lib/commit/5cb472cb710437cd5681f1eead606398e54a1f51))
* **combat:** add backwards and prone BMR multiplier keys (spec 081) ([1583e12](https://github.com/labcabrera/rmu-react-shared-lib/commit/1583e120a7f725ca2e70bf837a70e7e9cca5c98e))
* **combat:** add combat palette, action chips, side panel and guided steps ([99125a5](https://github.com/labcabrera/rmu-react-shared-lib/commit/99125a563a51975a7a082b0df5f4573c2ba2c5bb))
* **combat:** obMargin, the OB an attack action leaves (spec 082) ([7c32e6a](https://github.com/labcabrera/rmu-react-shared-lib/commit/7c32e6ad8efd6d10a3fc71fd532bdddc7bd5302c))
* **combat:** readiness states in ActionStateMarker and ApPips component (spec 011) ([4b0f91b](https://github.com/labcabrera/rmu-react-shared-lib/commit/4b0f91bb15db28bc93e2e2aba9761bdc21338a1f))
* contracts of extreme temperatures, held breath, fog and light sources (spec 079, phase 6) ([f136546](https://github.com/labcabrera/rmu-react-shared-lib/commit/f136546ab5de0585a3a8433700b5cd26f8a62cae))
* contracts of firing into melee, disarm and subdual (spec 079, phase 3) ([1cce1a6](https://github.com/labcabrera/rmu-react-shared-lib/commit/1cce1a6ab4d30aa20717bbc1c411e799b74d2918))
* contracts of lost limbs, healing without rest and revival (spec 079, phase 5) ([2950fae](https://github.com/labcabrera/rmu-react-shared-lib/commit/2950fae3289fd1eb6e0e97f1f1eb82bca2a243df))
* copy race api client (spec 074) ([2a009fd](https://github.com/labcabrera/rmu-react-shared-lib/commit/2a009fdb7114614a273aa762a9b2ccf1be0c7fa9))
* crafting quality types, materials and conditional modifiers (spec 043) ([d2ac79a](https://github.com/labcabrera/rmu-react-shared-lib/commit/d2ac79a281e2577e665cdd146606808dc31cbaa7))
* default images per entity kind, EntityAvatar and showcase loading state ([188f692](https://github.com/labcabrera/rmu-react-shared-lib/commit/188f692b706b532d71c0706e27dd8d48449d5e48))
* description of the style abilities (spec 032) ([f0d753a](https://github.com/labcabrera/rmu-react-shared-lib/commit/f0d753a3b593f838a5a092bf3c52bfa79564fe5a))
* **detail-page:** group the header icons and put the labelled Edit last ([362533c](https://github.com/labcabrera/rmu-react-shared-lib/commit/362533c0c90b1ea8ffb1aaa5029c180f255f4c17))
* details of the ledger entries (spec 043) ([177c2a0](https://github.com/labcabrera/rmu-react-shared-lib/commit/177c2a04a96c40a0a7bb43373f2c6ad2b1b5dc6b))
* **dialogs:** dismiss a dialog without a Close button (spec 066) ([52932cd](https://github.com/labcabrera/rmu-react-shared-lib/commit/52932cdf84d6315189c0f62441a667a4cbe10c5b))
* **effects:** delete icon on the effect chips ([44d733c](https://github.com/labcabrera/rmu-react-shared-lib/commit/44d733c5c29005e20a313f7d2b61de07e1cc80b4))
* encounter tables and resolve client (spec 061) ([86dd0fa](https://github.com/labcabrera/rmu-react-shared-lib/commit/86dd0fa4b0f6be88fd3bcd25581592854166ce9b))
* entity card description accepts a node ([957633e](https://github.com/labcabrera/rmu-react-shared-lib/commit/957633e47a155886f290ee2fd88f589002bc2abb))
* entity picker with images, picker presets and deprecated selects ([ec7e1b6](https://github.com/labcabrera/rmu-react-shared-lib/commit/ec7e1b6535ba40ffdcfb51f56285a1e5dfe2def4))
* entity source (rulebook vs user content) for spec 063 ([8767ba8](https://github.com/labcabrera/rmu-react-shared-lib/commit/8767ba8185b3410fc8961a5a7bba4a900eee7197))
* **enumerations:** show specialization keys by their catalog name ([4488711](https://github.com/labcabrera/rmu-react-shared-lib/commit/4488711be7a86a3e0097d11ab832e6b368df57c5))
* **enumerations:** toKey, the key core derives from a name ([ca2f217](https://github.com/labcabrera/rmu-react-shared-lib/commit/ca2f2178a79f761a89ca6fdf77210dd67804cd3e))
* explain a modifier by its source when its key has no text ([e5a7a00](https://github.com/labcabrera/rmu-react-shared-lib/commit/e5a7a00b655ee9f9cb6c04f547be16e540ca3c36))
* fighting styles types and calls (spec 032) ([d699943](https://github.com/labcabrera/rmu-react-shared-lib/commit/d6999439697f8041f533c35fd5104aec80e4c384))
* global npcs in campaign pickers (spec 073) ([b8db429](https://github.com/labcabrera/rmu-react-shared-lib/commit/b8db429c97663b1a39a79dff88ca2880f2af9637))
* health types, injury components, roll input and tactical game finish APIs (spec 013) ([69d5910](https://github.com/labcabrera/rmu-react-shared-lib/commit/69d591064ee15252b0048cb17ad356da29acbed3))
* **health:** campaign day on the injury card (spec 065) ([6f473d4](https://github.com/labcabrera/rmu-react-shared-lib/commit/6f473d4c3632e2aa912a85c62420896ab909e42f))
* **health:** injury care chips and temporary modifier list (spec 068) ([a839489](https://github.com/labcabrera/rmu-react-shared-lib/commit/a83948992e003c745ceb916cac82a7ff760b7dde))
* **i18n:** add spell name and description translation hooks ([e10e463](https://github.com/labcabrera/rmu-react-shared-lib/commit/e10e463f4af2474c2c9ac18323a80746a21262cc))
* **i18n:** add the useSkillText hook ([d1b555a](https://github.com/labcabrera/rmu-react-shared-lib/commit/d1b555a480b45b93f2362f31e90a02a7721099a7))
* **i18n:** load the namespace of an MFE in MfeRoot before rendering ([ee48426](https://github.com/labcabrera/rmu-react-shared-lib/commit/ee484260cb98adb3d715b24947725cc61b1f067b))
* **i18n:** useTableText translates the texts of the attack tables ([bd04393](https://github.com/labcabrera/rmu-react-shared-lib/commit/bd043935086b8aa198fecce9cc21d57319b31605))
* **images:** cultures category and translated category names in the image dialogs ([e5008a9](https://github.com/labcabrera/rmu-react-shared-lib/commit/e5008a9e5bc3ce719dedb7e5c898131e4f739f30))
* **images:** cultures category and translated category names in the image dialogs ([546424a](https://github.com/labcabrera/rmu-react-shared-lib/commit/546424a7b2453b873a1081239996e683543a1284))
* **images:** item category images and gallery opening on the entity folder ([aef0389](https://github.com/labcabrera/rmu-react-shared-lib/commit/aef038922e85fb52a27b0109076b7c8cab48f354))
* **images:** poison, property, acid, intoxicant and jewelry category images ([55ac3cd](https://github.com/labcabrera/rmu-react-shared-lib/commit/55ac3cd4e9663cf53db6462ab52451503a3aaf5e))
* **images:** spells image category and animal item category image ([28df250](https://github.com/labcabrera/rmu-react-shared-lib/commit/28df2507f24be079962a55907462729a483bf23c))
* **images:** weapon and armor image folders ([1c39ac1](https://github.com/labcabrera/rmu-react-shared-lib/commit/1c39ac193e995ef19d43b3770d9fb76fbd2f9612))
* item catalog browser, item card and catalog filters ([b89a1eb](https://github.com/labcabrera/rmu-react-shared-lib/commit/b89a1ebd885e763b847aaf3f5761c2fd8b4e4383))
* **item:** add the item operations API and economy components (spec 023) ([b84f707](https://github.com/labcabrera/rmu-react-shared-lib/commit/b84f7076d0af596bb47fef7fe458cbe15e18fdd0))
* **item:** general equipment types, ItemFeatureChips and category image fallback (spec 041) ([8047578](https://github.com/labcabrera/rmu-react-shared-lib/commit/8047578f7e4b1de14ba14426750198f2996365ed))
* **items:** equipped group, slot labels and linked highlight in the inventory ([7747f48](https://github.com/labcabrera/rmu-react-shared-lib/commit/7747f486fdca912bba6906b20f7420cc52722ffa))
* **items:** magic kind and level filters and a magic chip in the catalog (spec 067) ([5eb3d8c](https://github.com/labcabrera/rmu-react-shared-lib/commit/5eb3d8cb7d1c46e77308d9d68f3797a4e71c5b04))
* **items:** purchase orders, trading tables and modifier selections ([1b8f45b](https://github.com/labcabrera/rmu-react-shared-lib/commit/1b8f45b37bdda80a3a92b146ed707e102bea2dee))
* **items:** the item catalog selects the common rarity by default ([da7c41c](https://github.com/labcabrera/rmu-react-shared-lib/commit/da7c41c7ad55eb869e22564f876c492e5fa9ab0d))
* let RollField empty an optional roll and roll any die ([6e90985](https://github.com/labcabrera/rmu-react-shared-lib/commit/6e90985464b20a08ff9c017277830c320e1c1194))
* list filters in the URL, filter side panel and results bar in ListPage ([2b38250](https://github.com/labcabrera/rmu-react-shared-lib/commit/2b38250a9d6d0601949498b7209d0b16f607989b))
* **magic:** magic item, treasure and gem contracts with MagicItemInfo and GemTraits (spec 067) ([3d6bdc6](https://github.com/labcabrera/rmu-react-shared-lib/commit/3d6bdc66d1c63b5e168cba00682f1be344c31408))
* **maneuver:** reference modifiers and translated maneuver texts ([5ddcd20](https://github.com/labcabrera/rmu-react-shared-lib/commit/5ddcd20f702b785d3638f7c97d0ba40be116f46f))
* **maneuvers:** maneuver profile and modifier types, first die of open-ended rolls ([07fdde8](https://github.com/labcabrera/rmu-react-shared-lib/commit/07fdde868fa6507b6f27344b66d5cd195b0587a2))
* markdown viewer, visual/markdown editor and chronicle client ([ea15be0](https://github.com/labcabrera/rmu-react-shared-lib/commit/ea15be021554c7dafb6ef52e5f65d8c20abffef3))
* **markdown:** full width images option and heading tests from the wiki ([b28df22](https://github.com/labcabrera/rmu-react-shared-lib/commit/b28df226a0d224a0b72b848bd2f8f468379b63ff))
* npc attacks with no attack table ([80af191](https://github.com/labcabrera/rmu-react-shared-lib/commit/80af1919fafafbb3faf51f63d6c631c9b3d4e219))
* npc picker, npc entries and the dtos of faction and environment npcs ([f9ff837](https://github.com/labcabrera/rmu-react-shared-lib/commit/f9ff837b3f76e0d7214db87c5200aecc3068f764))
* npc shield with type, db, ranks and bonus ([a7e9bd0](https://github.com/labcabrera/rmu-react-shared-lib/commit/a7e9bd09755163a9cb66d90e13b9aa73e517adab))
* **npc:** optional fright level on the Npc type ([2b02e11](https://github.com/labcabrera/rmu-react-shared-lib/commit/2b02e1107a2428d2c6e2b9fb049d5f83020cd879))
* opaque app bar and accent-tinted selected list items ([b438292](https://github.com/labcabrera/rmu-react-shared-lib/commit/b438292cc032620729a4b34ad437c5497c9578d9))
* physical resistance roll context ([8fb55a8](https://github.com/labcabrera/rmu-react-shared-lib/commit/8fb55a8132717dda36f4aebb454166e2e9d983ee))
* **pickers:** formatLabel in the enum picker for values shown by name ([d715684](https://github.com/labcabrera/rmu-react-shared-lib/commit/d715684b3f15260b42ffbaec596f800deb431f21))
* **pickers:** order cultures and professions by their translated name ([8735166](https://github.com/labcabrera/rmu-react-shared-lib/commit/873516642a6cb50dc461e1eca997ea80966fc6bf))
* poison picker fields (spec 042) ([ab1dd6b](https://github.com/labcabrera/rmu-react-shared-lib/commit/ab1dd6bb7a5c392dfa9c97cee1117bbf1efb2a3b))
* poison types, poisoning timeline and poison feature lines (spec 042) ([679b284](https://github.com/labcabrera/rmu-react-shared-lib/commit/679b2845705f811da29dc268b5d3fce7a0be3aaa))
* power level presets, group experience and starting wealth dtos (spec 079, phase 8) ([981c83e](https://github.com/labcabrera/rmu-react-shared-lib/commit/981c83ed27b5e5185840130d6ce28086f0a282f1))
* put the title of the hero header over its chips and resources ([222c7cf](https://github.com/labcabrera/rmu-react-shared-lib/commit/222c7cf20b388550f746188d05b21eee406f178c))
* recovery breakdown and days explanation in the injury recovery type ([88b7c57](https://github.com/labcabrera/rmu-react-shared-lib/commit/88b7c57141cf80fc7eef6f38c038ed89ff40c84c))
* resolve asset paths against RMU_MFE_ASSETS_URI ([13889c0](https://github.com/labcabrera/rmu-react-shared-lib/commit/13889c04e7f00f898557a5ff6e3891a96431b520))
* resolve user uploads against the media origin and mark base images ([0ee05c8](https://github.com/labcabrera/rmu-react-shared-lib/commit/0ee05c87afe01320440fafd52122ae3206ce8662))
* **rmu:** add RollBreakdown and EffectList for combat results ([edc26e4](https://github.com/labcabrera/rmu-react-shared-lib/commit/edc26e4b0407bcea9e8ad6ef9f07da7089caf636))
* **rmu:** add StatusBadge and a compact EffectList variant ([9006860](https://github.com/labcabrera/rmu-react-shared-lib/commit/9006860013566fa76c3e1faceb8d33cec255c7b2))
* **rolls:** open-ended thresholds and saved dev points ([eba7681](https://github.com/labcabrera/rmu-react-shared-lib/commit/eba7681f9d938a3c998c8b34ee95a63fce0d7839))
* **rolls:** senses group in the roll breakdown (spec 076) ([76adf02](https://github.com/labcabrera/rmu-react-shared-lib/commit/76adf02386591242d7fb08ea70778f55963a8205))
* rule explanations by roll context, field hints and option descriptions ([b3a4729](https://github.com/labcabrera/rmu-react-shared-lib/commit/b3a472949996e38354532359747a5f95058c59b8))
* rule explanations in roll breakdowns and a standard roll field size ([7e9674f](https://github.com/labcabrera/rmu-react-shared-lib/commit/7e9674f39daf6eda22703980ffd3ba7a16bef1f3))
* **selectors:** shared CharacterPicker with avatars (spec 038) ([f197c6b](https://github.com/labcabrera/rmu-react-shared-lib/commit/f197c6ba7d701231e9187e1f5852a9d5a6942211))
* **selectors:** shared DifficultyPicker with skill difficulty guide ([04b5324](https://github.com/labcabrera/rmu-react-shared-lib/commit/04b5324c4d390f544dca495dea19b9e2fdc5479b))
* shared admin check with useIsAdmin ([2095c46](https://github.com/labcabrera/rmu-react-shared-lib/commit/2095c464821488bf4541cb4a1ca45a80be9ae053))
* **sharing:** entity access, realm shares and share dialog ([59b29db](https://github.com/labcabrera/rmu-react-shared-lib/commit/59b29dbaf4109455d22a89c386c5992adab3ac2f))
* side panel header and auto-fill cards in the item catalog browser ([ff66bbb](https://github.com/labcabrera/rmu-react-shared-lib/commit/ff66bbb76a2a0cec9a90fbf4d6c8c0281c36eb1c))
* side strength and ally factions in the character picker ([bbca397](https://github.com/labcabrera/rmu-react-shared-lib/commit/bbca39796d46a8fb614fdd90f27adf99a7320484))
* **skill-selector:** search skills by name across categories ([fe3fddd](https://github.com/labcabrera/rmu-react-shared-lib/commit/fe3fddd0dc9e388960b91d7896f89d776c355fcd))
* sort option in usePagedQuery and fetchTacticalGames ([20cb1d6](https://github.com/labcabrera/rmu-react-shared-lib/commit/20cb1d68f1b423ccbdca8bf0db98195624f1b6d9))
* spell types of spec 028 and SpellEffectList ([c1755ca](https://github.com/labcabrera/rmu-react-shared-lib/commit/c1755ca145ac373151ab182881b69356300b07c4))
* strategic game members, access levels and summaries (spec 071) ([444dd26](https://github.com/labcabrera/rmu-react-shared-lib/commit/444dd269839ff28e9b8b52bde2c7fc92ba545b5d))
* **strategic-game:** campaign calendar, pass time and time log (spec 065) ([3e7cb44](https://github.com/labcabrera/rmu-react-shared-lib/commit/3e7cb4481fe7cffad3332c7f981821b4129cf78e))
* strength weight of the character attacks (spec 040) ([38cf782](https://github.com/labcabrera/rmu-react-shared-lib/commit/38cf7824237e43b0731474b287f9eb1ac4e6d222))
* tactical contracts of combat block A (spec 079, phase 2) ([29f7879](https://github.com/labcabrera/rmu-react-shared-lib/commit/29f787968fa2b2d93a2926b28154a8cc330da4dc))
* talent contracts and situational talent chips (spec 079, phase 7) ([ad5dd8a](https://github.com/labcabrera/rmu-react-shared-lib/commit/ad5dd8a29fa58640d4ea7cfab9f258cafcc4cc75))
* **theme:** add example presets, a code editor preset and softer combat markers ([5ebbca3](https://github.com/labcabrera/rmu-react-shared-lib/commit/5ebbca358dbe6e3bdbe3ff2ff5d4db17306123b1))
* **theme:** mute the dark warning colour and make dark status chips tonal ([036b5ff](https://github.com/labcabrera/rmu-react-shared-lib/commit/036b5ff75321445f201d67b2fd6008d61b796a14)), closes [#ebeb75](https://github.com/labcabrera/rmu-react-shared-lib/issues/ebeb75)
* treasure law goods types, unit value and feature panels (spec 062) ([67a7f44](https://github.com/labcabrera/rmu-react-shared-lib/commit/67a7f44506bee7527c3ac57c71823a93843b21e2))
* treasure roll panel with dice rolled in the client ([0f63322](https://github.com/labcabrera/rmu-react-shared-lib/commit/0f63322adf70c27f7e3af9f4de9bc4c7bd200776))
* treasure tables as a view of the items module ([e4fd539](https://github.com/labcabrera/rmu-react-shared-lib/commit/e4fd53969641fefd9a53d2980d3ac1674df43696))
* **treasure:** treasure and magic item dialogs (spec 067) ([2bf0999](https://github.com/labcabrera/rmu-react-shared-lib/commit/2bf0999582f2389f7a9be5aa72c71a72a2bc1853))
* type the poison RR breakdown entries with their rules ([9f1b46b](https://github.com/labcabrera/rmu-react-shared-lib/commit/9f1b46b4d20edcabd56e1acfbe7cd2c6cdaad636))
* types and effects for spec 077 (spec 077, phase 5) ([2321c60](https://github.com/labcabrera/rmu-react-shared-lib/commit/2321c601fa491618ffa282c4293e533709c1380e))
* types for blocks B and C and talent group in the roll breakdown (spec 077, phase 5) ([0acd652](https://github.com/labcabrera/rmu-react-shared-lib/commit/0acd6520c0518fc50ad9f4d4f51b04df54f42366))
* types for hazards, critical alerts and fatigue of block D (spec 077, phase 5) ([c7a275b](https://github.com/labcabrera/rmu-react-shared-lib/commit/c7a275bb29634d272b28cf6767a45c5cc58d98a9))
* **ui:** option groups, roll cards, chip variants and horizontal flow steps ([f37dad5](https://github.com/labcabrera/rmu-react-shared-lib/commit/f37dad515f12c45a9eed166b491f11ddfc6ab623))
* version of core entities and the version-conflict error ([60c86f7](https://github.com/labcabrera/rmu-react-shared-lib/commit/60c86f72d964965a09db87623a1b7cc5979df1af))


### BREAKING CHANGES

* bootstrapMfe is removed, and the peers are now MUI 9.5,
i18next 27, react-i18next 18 and @tanstack/react-query 5.
* leaderId, isFactionCover and isCharacterSummary are gone.
* BackButton, NextButton, ClearButton, SaveButton, NumericReadonlyInput,
useError, RmuCard, RmuTextCard, textRed, textGreen, ActorRoundSelection and baseColors are
removed, and the internal helpers listed in the spec are no longer exported from the index.

New: SectionLabel, Bento, ChipRow, SelectableCard/selectableSx, MessageScreen,
OptionsHelpDialog/OptionsHelpButton, AccessTypeChip, critical severity colours,
RollResultAlert, list filter helpers, NumberPad and NumberPadField. Panel variant outlined
and dense, KeyValueList tones, EmptyState dense, LoadingState inline, DataTable paging and
empty title, SearchField with icon and outside value sync, DeleteDialog on ConfirmDialog.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
* cardMinWidth, the CardGrid minWidth prop, the ItemCatalogBrowser cardMinWidth
prop and the LoadingState cardMinWidth prop are removed; cardGridSx takes no argument.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
* EntityCard imageRatio, EntityAvatar variant, EditableAvatar, GenericAvatar,
gridSizeShowcase, gridSizeItemCard, CollectionConfig.cardSize, CardGrid size and the
LoadingState imageRatio/cardSize props are removed.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
* addNpcSkill, removeNpcSkill, addNpcAttack, removeNpcAttack and the AddNpcSkill
and AddNpcAttack DTOs are removed (the API has no subresources any more: PATCH replaces the
lists). The Npc, NpcSkill and NpcAttack shapes change, and fetchNpcs encodes the RSQL query.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
* FactionManagement has no availableXP, addFactionXP is removed and the
import preview summary has no xp.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
* use RealmPicker, EntityPicker, EnumPicker, DifficultyPicker, AttackTablePicker
and FumbleTablePicker instead.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
* SpellTarget and the old duration and range types are
removed.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
* RollInput, rollD100, GeneratedRoll, OpenEndedRollInput,
randomD100, OpenEndedRollDetails, OpenEndedRollProps, ConfirmedRollInput
and OpenEndedRollDialog are no longer exported. Use RollField with a
RollSpec preset (D100, OPEN_D100...) and rollDice.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

## [0.1.4](https://github.com/labcabrera/rmu-react-shared-lib/compare/0.1.3...0.1.4) (2026-10-04)
