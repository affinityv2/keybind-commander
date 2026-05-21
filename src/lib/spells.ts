import type { CategoryId } from "./categories";

export interface Spell {
  id: string;
  name: string;
  icon: string; // wow.zamimg icon filename without extension
  categories: CategoryId[]; // a spell can fit one or more categories
}

export interface ClassSpec {
  id: string;
  name: string;
  spells: Spell[]; // spec-specific spells
}

export interface WowClass {
  id: string;
  name: string;
  color: string; // class color
  shared: Spell[]; // baseline spells available to all specs
  specs: ClassSpec[];
}

const icon = (n: string) => n; // helper for readability

export const CLASSES: WowClass[] = [
  {
    id: "warrior",
    name: "Warrior",
    color: "#C69B6D",
    shared: [
      { id: "war_pummel",         name: "Pummel",            icon: icon("inv_gauntlets_04"),               categories: ["interrupt"] },
      { id: "war_shieldwall",     name: "Shield Wall",       icon: icon("ability_warrior_shieldwall"),     categories: ["defensive"] },
      { id: "war_rallying",       name: "Rallying Cry",      icon: icon("ability_warrior_rallyingcry"),    categories: ["raid_cd", "defensive"] },
      { id: "war_charge",         name: "Charge",            icon: icon("ability_warrior_charge"),         categories: ["gap_closer", "movement"] },
      { id: "war_heroicleap",     name: "Heroic Leap",       icon: icon("ability_heroicleap"),             categories: ["movement", "gap_closer"] },
      { id: "war_intimidating",   name: "Intimidating Shout",icon: icon("ability_golemthunderclap"),       categories: ["cc"] },
      { id: "war_stormbolt",      name: "Storm Bolt",        icon: icon("warrior_talent_icon_stormbolt"),  categories: ["stun"] },
      { id: "war_berserker",      name: "Berserker Rage",    icon: icon("spell_nature_ancestralguardian"), categories: ["utility_1"] },
      { id: "war_victoryrush",    name: "Impending Victory", icon: icon("ability_warrior_devastate"),      categories: ["self_heal"] },
    ],
    specs: [
      { id: "arms", name: "Arms", spells: [
        { id: "war_avatar",   name: "Avatar",       icon: icon("warrior_talent_icon_avatar"),    categories: ["major_cd"] },
        { id: "war_bladestm", name: "Bladestorm",   icon: icon("ability_warrior_bladestorm"),    categories: ["burst_cd", "aoe_dmg", "immunity"] },
        { id: "war_execute_a",name: "Execute",      icon: icon("inv_sword_48"),                  categories: ["execute"] },
        { id: "war_dieby",    name: "Die by the Sword", icon: icon("ability_warrior_challange"), categories: ["defensive"] },
      ]},
      { id: "fury", name: "Fury", spells: [
        { id: "war_recklessness", name: "Recklessness", icon: icon("warrior_talent_icon_innerrage"), categories: ["major_cd"] },
        { id: "war_enraged",      name: "Enraged Regen", icon: icon("ability_warrior_focusedrage"), categories: ["self_heal", "defensive"] },
        { id: "war_execute_f",    name: "Execute",       icon: icon("inv_sword_48"),                categories: ["execute"] },
        { id: "war_bloodthirst",  name: "Bloodthirst",   icon: icon("spell_nature_bloodlust"),      categories: ["self_heal"] },
      ]},
      { id: "protection", name: "Protection", spells: [
        { id: "war_lastsstand",   name: "Last Stand",      icon: icon("spell_holy_ashestoashes"),    categories: ["defensive"] },
        { id: "war_avatar_p",     name: "Avatar",          icon: icon("warrior_talent_icon_avatar"), categories: ["major_cd"] },
        { id: "war_shieldblock",  name: "Shield Block",    icon: icon("ability_defend"),             categories: ["defensive"] },
        { id: "war_spellreflect", name: "Spell Reflection",icon: icon("ability_warrior_shieldreflection"), categories: ["immunity", "defensive"] },
      ]},
    ],
  },
  {
    id: "paladin",
    name: "Paladin",
    color: "#F58CBA",
    shared: [
      { id: "pal_rebuke",       name: "Rebuke",            icon: icon("spell_holy_rebuke"),                categories: ["interrupt"] },
      { id: "pal_bop",          name: "Blessing of Protection", icon: icon("spell_holy_sealofprotection"), categories: ["immunity", "defensive"] },
      { id: "pal_divshield",    name: "Divine Shield",     icon: icon("spell_holy_divineshield"),          categories: ["immunity"] },
      { id: "pal_lay",          name: "Lay on Hands",      icon: icon("spell_holy_layonhands"),            categories: ["self_heal", "raid_cd"] },
      { id: "pal_steed",        name: "Divine Steed",      icon: icon("ability_paladin_divinesteed"),      categories: ["movement"] },
      { id: "pal_hammer",       name: "Hammer of Justice", icon: icon("spell_holy_sealofmight"),           categories: ["stun"] },
      { id: "pal_repent",       name: "Repentance",        icon: icon("spell_holy_prayerofhealing02"),     categories: ["cc"] },
      { id: "pal_cleanse",      name: "Cleanse Toxins",    icon: icon("spell_holy_renew"),                 categories: ["dispel"] },
      { id: "pal_freedom",      name: "Blessing of Freedom", icon: icon("spell_holy_sealofvalor"),         categories: ["utility_1"] },
      { id: "pal_sac",          name: "Blessing of Sacrifice", icon: icon("spell_holy_sealofsacrifice"),   categories: ["raid_cd"] },
    ],
    specs: [
      { id: "holy", name: "Holy", spells: [
        { id: "pal_avenging_h", name: "Avenging Wrath", icon: icon("spell_holy_avenginewrath"), categories: ["major_cd"] },
        { id: "pal_aura_mast",  name: "Aura Mastery",   icon: icon("spell_holy_auramastery"),   categories: ["raid_cd"] },
        { id: "pal_dispel_h",   name: "Cleanse",        icon: icon("spell_holy_renew"),         categories: ["dispel"] },
      ]},
      { id: "protection", name: "Protection", spells: [
        { id: "pal_ardent",     name: "Ardent Defender", icon: icon("spell_holy_ardentdefender"), categories: ["defensive"] },
        { id: "pal_guardian",   name: "Guardian of Ancient Kings", icon: icon("spell_holy_heroism"), categories: ["defensive"] },
        { id: "pal_avengshield",name: "Avenger's Shield",icon: icon("spell_holy_avengersshield"), categories: ["gap_closer", "interrupt"] },
      ]},
      { id: "retribution", name: "Retribution", spells: [
        { id: "pal_wings_r",    name: "Avenging Wrath",  icon: icon("spell_holy_avenginewrath"),  categories: ["major_cd"] },
        { id: "pal_shield_r",   name: "Shield of Vengeance", icon: icon("ability_paladin_shieldofthetemplar"), categories: ["defensive"] },
        { id: "pal_execution",  name: "Execution Sentence", icon: icon("spell_paladin_executionsentence"),    categories: ["burst_cd"] },
      ]},
    ],
  },
  {
    id: "hunter",
    name: "Hunter",
    color: "#AAD372",
    shared: [
      { id: "hun_counter",    name: "Counter Shot",       icon: icon("ability_hunter_aspectoftheviper"), categories: ["interrupt"] },
      { id: "hun_turtle",     name: "Aspect of the Turtle", icon: icon("ability_hunter_pet_turtle"),     categories: ["immunity"] },
      { id: "hun_exhilar",    name: "Exhilaration",       icon: icon("ability_hunter_onewithnature"),    categories: ["self_heal"] },
      { id: "hun_cheetah",    name: "Aspect of the Cheetah", icon: icon("ability_mount_jungletiger"),    categories: ["movement"] },
      { id: "hun_disengage",  name: "Disengage",          icon: icon("ability_rogue_feint"),             categories: ["movement"] },
      { id: "hun_freezing",   name: "Freezing Trap",      icon: icon("spell_frost_chainsofice"),         categories: ["cc"] },
      { id: "hun_intim",      name: "Intimidation",       icon: icon("ability_devour"),                  categories: ["stun"] },
      { id: "hun_tranq",      name: "Tranquilizing Shot", icon: icon("ability_hunter_aimedshot"),        categories: ["purge"] },
      { id: "hun_misd",       name: "Misdirection",       icon: icon("ability_hunter_misdirection"),     categories: ["utility_1"] },
    ],
    specs: [
      { id: "beast_mastery", name: "Beast Mastery", spells: [
        { id: "hun_bestial", name: "Bestial Wrath",     icon: icon("ability_druid_ferociousbite"),  categories: ["major_cd"] },
        { id: "hun_acherd",  name: "Aspect of the Wild",icon: icon("spell_nature_protectionformnature"), categories: ["burst_cd"] },
      ]},
      { id: "marksmanship", name: "Marksmanship", spells: [
        { id: "hun_trueshot",name: "Trueshot",          icon: icon("ability_trueshot"),             categories: ["major_cd"] },
        { id: "hun_volley",  name: "Volley",            icon: icon("ability_hunter_rapidkilling"),  categories: ["aoe_dmg"] },
      ]},
      { id: "survival", name: "Survival", spells: [
        { id: "hun_coordi",  name: "Coordinated Assault",icon: icon("inv_ability_hunter_coordinatedassault"), categories: ["major_cd"] },
        { id: "hun_wing",    name: "Wing Clip",         icon: icon("ability_rogue_trip"),            categories: ["utility_2"] },
      ]},
    ],
  },
  {
    id: "mage",
    name: "Mage",
    color: "#3FC7EB",
    shared: [
      { id: "mage_counter",    name: "Counterspell",    icon: icon("spell_frost_iceshock"),            categories: ["interrupt"] },
      { id: "mage_iceblock",   name: "Ice Block",       icon: icon("spell_frost_frost"),               categories: ["immunity"] },
      { id: "mage_blink",      name: "Blink",           icon: icon("spell_arcane_blink"),              categories: ["movement"] },
      { id: "mage_polymorph",  name: "Polymorph",       icon: icon("spell_nature_polymorph"),          categories: ["cc"] },
      { id: "mage_invis",      name: "Invisibility",    icon: icon("ability_mage_invisibility"),       categories: ["utility_1", "defensive"] },
      { id: "mage_spellsteal", name: "Spellsteal",      icon: icon("spell_arcane_arcane02"),           categories: ["purge"] },
      { id: "mage_remove",     name: "Remove Curse",    icon: icon("spell_nature_removecurse"),        categories: ["dispel"] },
      { id: "mage_barrier",    name: "Mass Barrier",    icon: icon("spell_arcane_prismaticcloak"),     categories: ["raid_cd"] },
      { id: "mage_alter",      name: "Alter Time",      icon: icon("spell_mage_altertime"),            categories: ["defensive", "self_heal"] },
    ],
    specs: [
      { id: "arcane", name: "Arcane", spells: [
        { id: "mage_arcsurge", name: "Arcane Surge",   icon: icon("spell_nature_wispsplode"),         categories: ["major_cd"] },
        { id: "mage_evocation",name: "Evocation",      icon: icon("spell_nature_purge"),              categories: ["self_heal"] },
        { id: "mage_touchm",   name: "Touch of the Magi", icon: icon("spell_arcane_arcane01"),       categories: ["burst_cd"] },
      ]},
      { id: "fire", name: "Fire", spells: [
        { id: "mage_combust",  name: "Combustion",     icon: icon("spell_fire_sealoffire"),           categories: ["major_cd"] },
        { id: "mage_dragon",   name: "Dragon's Breath",icon: icon("inv_misc_head_dragon_01"),         categories: ["cc"] },
        { id: "mage_pyro",     name: "Pyroblast",      icon: icon("spell_fire_fireball02"),           categories: ["execute"] },
      ]},
      { id: "frost", name: "Frost", spells: [
        { id: "mage_icyveins", name: "Icy Veins",      icon: icon("spell_frost_coldhearted"),         categories: ["major_cd"] },
        { id: "mage_frostnova",name: "Frost Nova",     icon: icon("spell_frost_frostnova"),           categories: ["stun"] },
        { id: "mage_coldsnap", name: "Cold Snap",      icon: icon("spell_frost_wizardmark"),          categories: ["self_heal"] },
      ]},
    ],
  },
  {
    id: "priest",
    name: "Priest",
    color: "#FFFFFF",
    shared: [
      { id: "pri_silence",   name: "Silence",          icon: icon("ability_priest_silence"),          categories: ["interrupt"] },
      { id: "pri_disperse",  name: "Dispersion",       icon: icon("spell_shadow_dispersion"),         categories: ["defensive", "immunity"] },
      { id: "pri_pws",       name: "Power Word: Shield", icon: icon("spell_holy_powerwordshield"),    categories: ["defensive"] },
      { id: "pri_fade",      name: "Fade",             icon: icon("spell_magic_lesserinvisibilty"),   categories: ["movement", "utility_1"] },
      { id: "pri_psyscream", name: "Psychic Scream",   icon: icon("spell_shadow_psychicscream"),      categories: ["cc"] },
      { id: "pri_masdispel", name: "Mass Dispel",      icon: icon("spell_arcane_massdispel"),         categories: ["dispel", "purge"] },
      { id: "pri_lifeswap",  name: "Leap of Faith",    icon: icon("priest_spell_leapoffaith_a"),      categories: ["utility_2"] },
      { id: "pri_vampemb",   name: "Vampiric Embrace", icon: icon("spell_shadow_unsummonbuilding"),   categories: ["self_heal", "raid_cd"] },
    ],
    specs: [
      { id: "discipline", name: "Discipline", spells: [
        { id: "pri_painsup",   name: "Pain Suppression", icon: icon("spell_holy_painsupression"),   categories: ["defensive", "raid_cd"] },
        { id: "pri_rapture",   name: "Rapture",          icon: icon("spell_holy_rapture"),          categories: ["major_cd"] },
        { id: "pri_powerinf",  name: "Power Infusion",   icon: icon("spell_holy_powerinfusion"),    categories: ["major_cd"] },
      ]},
      { id: "holy", name: "Holy", spells: [
        { id: "pri_guardian",  name: "Guardian Spirit",  icon: icon("spell_holy_guardianspirit"),   categories: ["defensive", "raid_cd"] },
        { id: "pri_divhymn",   name: "Divine Hymn",      icon: icon("spell_holy_divinehymn"),       categories: ["raid_cd"] },
        { id: "pri_apotheosis",name: "Apotheosis",       icon: icon("ability_priest_ascension"),    categories: ["major_cd"] },
      ]},
      { id: "shadow", name: "Shadow", spells: [
        { id: "pri_voidform",  name: "Voidform",         icon: icon("spell_priest_voidform"),       categories: ["major_cd"] },
        { id: "pri_shadowfiend",name: "Shadowfiend",     icon: icon("spell_shadow_shadowfiend"),    categories: ["burst_cd"] },
        { id: "pri_devour",    name: "Devouring Plague", icon: icon("spell_shadow_devouringplague"),categories: ["execute"] },
      ]},
    ],
  },
  {
    id: "rogue",
    name: "Rogue",
    color: "#FFF468",
    shared: [
      { id: "rog_kick",      name: "Kick",            icon: icon("ability_kick"),                    categories: ["interrupt"] },
      { id: "rog_cloak",     name: "Cloak of Shadows",icon: icon("spell_shadow_nethercloak"),        categories: ["immunity"] },
      { id: "rog_vanish",    name: "Vanish",          icon: icon("ability_vanish"),                  categories: ["immunity", "movement"] },
      { id: "rog_evasion",   name: "Evasion",         icon: icon("spell_shadow_shadowward"),         categories: ["defensive"] },
      { id: "rog_feint",     name: "Feint",           icon: icon("ability_rogue_feint"),             categories: ["defensive"] },
      { id: "rog_sprint",    name: "Sprint",          icon: icon("ability_rogue_sprint"),            categories: ["movement"] },
      { id: "rog_grappling", name: "Grappling Hook",  icon: icon("ability_rogue_grapplinghook"),     categories: ["gap_closer", "movement"] },
      { id: "rog_kidney",    name: "Kidney Shot",     icon: icon("ability_rogue_kidneyshot"),        categories: ["stun"] },
      { id: "rog_sap",       name: "Sap",             icon: icon("ability_sap"),                     categories: ["cc"] },
      { id: "rog_blind",     name: "Blind",           icon: icon("spell_shadow_mindsteal"),          categories: ["cc"] },
      { id: "rog_shiv",      name: "Shiv",            icon: icon("inv_throwingknife_06"),            categories: ["purge"] },
      { id: "rog_crimson",   name: "Crimson Vial",    icon: icon("inv_alchemy_elixir_05"),           categories: ["self_heal"] },
    ],
    specs: [
      { id: "assassination", name: "Assassination", spells: [
        { id: "rog_deathmark", name: "Deathmark",     icon: icon("inv_ability_assassinationrogue_deathmark"), categories: ["major_cd"] },
      ]},
      { id: "outlaw", name: "Outlaw", spells: [
        { id: "rog_adrenaline",name: "Adrenaline Rush",icon: icon("spell_shadow_shadowworddominate"),categories: ["major_cd"] },
        { id: "rog_bladeflur", name: "Blade Flurry",  icon: icon("ability_rogue_bladeflurry"),       categories: ["aoe_dmg"] },
      ]},
      { id: "subtlety", name: "Subtlety", spells: [
        { id: "rog_shadowdance",name:"Shadow Dance",  icon: icon("ability_rogue_shadowdance"),       categories: ["burst_cd"] },
        { id: "rog_shadowblades",name:"Shadow Blades",icon: icon("inv_knife_1h_grimbatolraid_d_03"),categories: ["major_cd"] },
      ]},
    ],
  },
  {
    id: "shaman",
    name: "Shaman",
    color: "#0070DE",
    shared: [
      { id: "sha_windshear", name: "Wind Shear",      icon: icon("spell_nature_cyclone"),            categories: ["interrupt"] },
      { id: "sha_astralshift",name:"Astral Shift",    icon: icon("spell_shaman_astralshift"),        categories: ["defensive"] },
      { id: "sha_ghostwolf", name: "Ghost Wolf",      icon: icon("spell_nature_spiritwolf"),         categories: ["movement"] },
      { id: "sha_hex",       name: "Hex",             icon: icon("spell_shaman_hex"),                categories: ["cc"] },
      { id: "sha_purge",     name: "Purge",           icon: icon("spell_nature_purge"),              categories: ["purge"] },
      { id: "sha_tremor",    name: "Tremor Totem",    icon: icon("spell_nature_tremortotem"),        categories: ["utility_1"] },
      { id: "sha_capacitor", name: "Capacitor Totem", icon: icon("spell_nature_brilliance"),         categories: ["stun"] },
      { id: "sha_grounding", name: "Grounding Totem", icon: icon("spell_nature_groundingtotem"),     categories: ["utility_2"] },
      { id: "sha_blooldust", name: "Bloodlust",       icon: icon("spell_nature_bloodlust"),          categories: ["major_cd", "raid_cd"] },
    ],
    specs: [
      { id: "elemental", name: "Elemental", spells: [
        { id: "sha_stormkeep",name: "Stormkeeper",    icon: icon("ability_thunderking_lightningwhip"),categories: ["burst_cd"] },
        { id: "sha_firelem",  name: "Fire Elemental", icon: icon("spell_fire_elemental_totem"),      categories: ["major_cd"] },
        { id: "sha_earthshield",name:"Earth Shield",  icon: icon("spell_nature_skinofearth"),        categories: ["self_heal"] },
      ]},
      { id: "enhancement", name: "Enhancement", spells: [
        { id: "sha_feralspirit",name:"Feral Spirit",  icon: icon("spell_shaman_feralspirit"),        categories: ["major_cd"] },
        { id: "sha_doomwinds", name: "Doom Winds",    icon: icon("ability_ironmaidens_swirl"),       categories: ["burst_cd"] },
        { id: "sha_healsurge", name: "Healing Surge", icon: icon("spell_nature_healingway"),         categories: ["self_heal"] },
      ]},
      { id: "restoration", name: "Restoration", spells: [
        { id: "sha_tide",      name: "Spirit Link Totem",icon: icon("spell_shaman_spiritlink"),     categories: ["raid_cd"] },
        { id: "sha_ascend",    name: "Ascendance",    icon: icon("spell_fire_elementaldevastation"), categories: ["major_cd"] },
        { id: "sha_purify",    name: "Purify Spirit", icon: icon("spell_nature_giftofthewaterspirit"),categories: ["dispel"] },
      ]},
    ],
  },
  {
    id: "warlock",
    name: "Warlock",
    color: "#8788EE",
    shared: [
      { id: "lock_spelllock", name: "Spell Lock",     icon: icon("spell_shadow_mindrot"),            categories: ["interrupt"] },
      { id: "lock_unending",  name: "Unending Resolve",icon: icon("spell_shadow_demonictactics"),    categories: ["defensive"] },
      { id: "lock_circle",    name: "Demonic Circle: Teleport", icon: icon("spell_shadow_demoniccirclesummon"), categories: ["movement"] },
      { id: "lock_burning",   name: "Burning Rush",   icon: icon("ability_deathwing_sealarmorbreachtga"), categories: ["movement"] },
      { id: "lock_fear",      name: "Fear",           icon: icon("spell_shadow_possession"),         categories: ["cc"] },
      { id: "lock_banish",    name: "Banish",         icon: icon("spell_shadow_cripple"),            categories: ["cc"] },
      { id: "lock_healthstone",name:"Healthstone",    icon: icon("inv_stone_04"),                    categories: ["self_heal"] },
      { id: "lock_curse",     name: "Curse of Tongues",icon: icon("spell_shadow_curseoftounges"),    categories: ["utility_1"] },
      { id: "lock_dispel",    name: "Singe Magic (Imp)", icon: icon("spell_fire_flameshock"),        categories: ["dispel"] },
      { id: "lock_axetoss",   name: "Axe Toss (Felguard)", icon: icon("ability_warrior_titansgrip"), categories: ["stun"] },
    ],
    specs: [
      { id: "affliction", name: "Affliction", spells: [
        { id: "lock_dark_a", name: "Dark Soul: Misery",  icon: icon("spell_warlock_soulburn"),       categories: ["major_cd"] },
        { id: "lock_haunt",  name: "Haunt",              icon: icon("ability_warlock_haunt"),        categories: ["burst_cd"] },
      ]},
      { id: "demonology", name: "Demonology", spells: [
        { id: "lock_tyrant", name: "Summon Demonic Tyrant", icon: icon("inv_summondemonictyrant"),  categories: ["major_cd"] },
        { id: "lock_imps",   name: "Implosion",          icon: icon("spell_fel_implosion"),          categories: ["aoe_dmg"] },
      ]},
      { id: "destruction", name: "Destruction", spells: [
        { id: "lock_havoc",  name: "Havoc",              icon: icon("ability_warlock_baneofhavoc"),  categories: ["burst_cd"] },
        { id: "lock_chaos",  name: "Summon Infernal",    icon: icon("spell_shadow_summoninfernal"),  categories: ["major_cd"] },
        { id: "lock_shadowburn",name:"Shadowburn",       icon: icon("spell_shadow_scourgebuild"),    categories: ["execute"] },
      ]},
    ],
  },
  {
    id: "deathknight",
    name: "Death Knight",
    color: "#C41E3A",
    shared: [
      { id: "dk_mindfreeze", name: "Mind Freeze",     icon: icon("spell_deathknight_mindfreeze"),    categories: ["interrupt"] },
      { id: "dk_amz",        name: "Anti-Magic Zone", icon: icon("spell_deathknight_antimagiczone"), categories: ["raid_cd"] },
      { id: "dk_ams",        name: "Anti-Magic Shell",icon: icon("spell_shadow_antimagicshell"),     categories: ["immunity", "defensive"] },
      { id: "dk_icebound",   name: "Icebound Fortitude",icon: icon("spell_deathknight_iceboundfortitude"), categories: ["defensive"] },
      { id: "dk_deathgrip",  name: "Death Grip",      icon: icon("spell_deathknight_strangulate"),   categories: ["gap_closer", "utility_1"] },
      { id: "dk_chains",     name: "Chains of Ice",   icon: icon("spell_frost_chainsofice"),         categories: ["utility_2"] },
      { id: "dk_asphyxiate", name: "Asphyxiate",      icon: icon("ability_deathknight_asphixiate"),  categories: ["stun"] },
      { id: "dk_deathstrike",name: "Death Strike",    icon: icon("spell_deathknight_butcher2"),      categories: ["self_heal"] },
      { id: "dk_wraithwalk", name: "Wraith Walk",     icon: icon("ability_deathknight_wraithwalk"),  categories: ["movement"] },
    ],
    specs: [
      { id: "blood", name: "Blood", spells: [
        { id: "dk_vampblood", name: "Vampiric Blood", icon: icon("spell_shadow_lifedrain"),          categories: ["defensive"] },
        { id: "dk_dancingrw", name: "Dancing Rune Weapon",icon: icon("inv_sword_07"),                categories: ["major_cd"] },
      ]},
      { id: "frost", name: "Frost", spells: [
        { id: "dk_pillar",    name: "Pillar of Frost",icon: icon("ability_deathknight_pillaroffrost"),categories: ["major_cd"] },
        { id: "dk_breath",    name: "Breath of Sindragosa", icon: icon("spell_deathknight_breathofsindragosa"), categories: ["burst_cd"] },
      ]},
      { id: "unholy", name: "Unholy", spells: [
        { id: "dk_apoc",      name: "Apocalypse",     icon: icon("artifactability_unholydeathknight_deathsembrace"), categories: ["burst_cd"] },
        { id: "dk_unholy_a",  name: "Unholy Assault", icon: icon("spell_deathvsdeath"),              categories: ["major_cd"] },
      ]},
    ],
  },
  {
    id: "monk",
    name: "Monk",
    color: "#00FF98",
    shared: [
      { id: "monk_sck",      name: "Spear Hand Strike", icon: icon("ability_monk_spearhand"),        categories: ["interrupt"] },
      { id: "monk_diffuse",  name: "Diffuse Magic",   icon: icon("spell_monk_diffusemagic"),         categories: ["defensive"] },
      { id: "monk_dampen",   name: "Dampen Harm",     icon: icon("ability_monk_dampenharm"),         categories: ["defensive"] },
      { id: "monk_touchok",  name: "Touch of Karma",  icon: icon("ability_monk_touchofkarma"),       categories: ["defensive"] },
      { id: "monk_roll",     name: "Roll",            icon: icon("ability_monk_roll"),               categories: ["movement"] },
      { id: "monk_tigerlust",name: "Tiger's Lust",    icon: icon("ability_monk_tigerslust"),         categories: ["movement", "utility_1"] },
      { id: "monk_paralysis",name: "Paralysis",       icon: icon("ability_monk_paralysis"),          categories: ["cc"] },
      { id: "monk_legsweep", name: "Leg Sweep",       icon: icon("ability_monk_legsweep"),           categories: ["stun"] },
      { id: "monk_detox",    name: "Detox",           icon: icon("ability_rogue_imrovedrecuperate"), categories: ["dispel"] },
      { id: "monk_vivify",   name: "Vivify",          icon: icon("ability_monk_vivify"),             categories: ["self_heal"] },
    ],
    specs: [
      { id: "brewmaster", name: "Brewmaster", spells: [
        { id: "monk_purifyb",name: "Purifying Brew",  icon: icon("ability_monk_quipinghand"),        categories: ["defensive"] },
        { id: "monk_celestbrew",name:"Celestial Brew",icon: icon("ability_monk_ironskinbrew"),       categories: ["defensive"] },
      ]},
      { id: "mistweaver", name: "Mistweaver", spells: [
        { id: "monk_revival",name: "Revival",         icon: icon("spell_monk_revival"),              categories: ["raid_cd"] },
        { id: "monk_lifecoc",name: "Life Cocoon",     icon: icon("ability_monk_chicocoon"),          categories: ["raid_cd"] },
      ]},
      { id: "windwalker", name: "Windwalker", spells: [
        { id: "monk_storm",  name: "Storm, Earth, and Fire", icon: icon("spell_nature_giftofthewild"), categories: ["major_cd"] },
        { id: "monk_xuen",   name: "Invoke Xuen",     icon: icon("ability_monk_summontigerstatue"),  categories: ["major_cd"] },
        { id: "monk_serenity",name:"Serenity",        icon: icon("ability_monk_serenity"),           categories: ["burst_cd"] },
      ]},
    ],
  },
  {
    id: "druid",
    name: "Druid",
    color: "#FF7C0A",
    shared: [
      { id: "dru_skullbash", name: "Skull Bash",      icon: icon("ability_druid_skullbash"),         categories: ["interrupt"] },
      { id: "dru_solarbeam", name: "Solar Beam",      icon: icon("ability_vehicle_sonicshockwave"),  categories: ["interrupt"] },
      { id: "dru_barkskin",  name: "Barkskin",        icon: icon("spell_nature_stoneclawtotem"),     categories: ["defensive"] },
      { id: "dru_dash",      name: "Dash",            icon: icon("ability_druid_dash"),              categories: ["movement"] },
      { id: "dru_stampedingroar",name:"Stampeding Roar",icon: icon("spell_druid_stampedingroar_cat"),categories: ["raid_cd", "movement"] },
      { id: "dru_cyclone",   name: "Cyclone",         icon: icon("spell_nature_earthbind"),          categories: ["cc"] },
      { id: "dru_hibernate", name: "Hibernate",       icon: icon("spell_nature_sleep"),              categories: ["cc"] },
      { id: "dru_remcorr",   name: "Remove Corruption",icon: icon("spell_holy_removecurse"),         categories: ["dispel"] },
      { id: "dru_innervate", name: "Innervate",       icon: icon("spell_nature_lightning"),          categories: ["utility_1"] },
      { id: "dru_renewal",   name: "Renewal",         icon: icon("spell_nature_natureblessing"),     categories: ["self_heal"] },
    ],
    specs: [
      { id: "balance", name: "Balance", spells: [
        { id: "dru_celestial",name:"Celestial Alignment",icon:icon("spell_nature_natureguardian"),   categories: ["major_cd"] },
        { id: "dru_starfall", name: "Starfall",       icon: icon("ability_druid_starfall"),          categories: ["aoe_dmg"] },
      ]},
      { id: "feral", name: "Feral", spells: [
        { id: "dru_berserk_f",name: "Berserk",        icon: icon("ability_druid_berserk"),           categories: ["major_cd"] },
        { id: "dru_tigerfury",name: "Tiger's Fury",   icon: icon("ability_mount_jungletiger"),       categories: ["burst_cd"] },
      ]},
      { id: "guardian", name: "Guardian", spells: [
        { id: "dru_survival_g",name:"Survival Instincts",icon: icon("ability_druid_tigersroar"),     categories: ["defensive"] },
        { id: "dru_frenzied",  name: "Frenzied Regeneration", icon: icon("ability_bullrush"),        categories: ["self_heal"] },
      ]},
      { id: "restoration", name: "Restoration", spells: [
        { id: "dru_tranq",    name: "Tranquility",    icon: icon("spell_nature_tranquility"),        categories: ["raid_cd"] },
        { id: "dru_treeoflife",name:"Incarnation: Tree of Life", icon: icon("ability_druid_improvedtreeform"), categories: ["major_cd"] },
      ]},
    ],
  },
  {
    id: "demonhunter",
    name: "Demon Hunter",
    color: "#A330C9",
    shared: [
      { id: "dh_disrupt",    name: "Disrupt",         icon: icon("ability_demonhunter_consumemagic"),categories: ["interrupt"] },
      { id: "dh_blur",       name: "Blur",            icon: icon("ability_demonhunter_blur"),        categories: ["defensive"] },
      { id: "dh_netherwalk", name: "Netherwalk",      icon: icon("spell_warlock_demonsoul"),         categories: ["immunity"] },
      { id: "dh_darkness",   name: "Darkness",        icon: icon("ability_demonhunter_darkness"),    categories: ["raid_cd"] },
      { id: "dh_meta",       name: "Metamorphosis",   icon: icon("ability_demonhunter_metamorphasisdps"), categories: ["major_cd"] },
      { id: "dh_vengrt",     name: "Vengeful Retreat",icon: icon("ability_demonhunter_vengefulretreat2"), categories: ["movement"] },
      { id: "dh_felrush",    name: "Fel Rush",        icon: icon("ability_demonhunter_felrush"),     categories: ["movement", "gap_closer"] },
      { id: "dh_imprison",   name: "Imprison",        icon: icon("ability_demonhunter_imprison"),    categories: ["cc"] },
      { id: "dh_chaosnova",  name: "Chaos Nova",      icon: icon("spell_fire_felfirenova"),          categories: ["stun"] },
      { id: "dh_consume",    name: "Consume Magic",   icon: icon("ability_demonhunter_consumemagic"),categories: ["purge"] },
    ],
    specs: [
      { id: "havoc", name: "Havoc", spells: [
        { id: "dh_eyebeam",   name: "Eye Beam",       icon: icon("ability_demonhunter_eyebeam"),     categories: ["burst_cd", "aoe_dmg"] },
        { id: "dh_essence",   name: "Essence Break",  icon: icon("inv_glaive_1h_demonhunter_a_01"),  categories: ["burst_cd"] },
      ]},
      { id: "vengeance", name: "Vengeance", spells: [
        { id: "dh_metavenge", name: "Metamorphosis (Tank)", icon: icon("ability_demonhunter_metamorphasistank"),categories: ["defensive"] },
        { id: "dh_demspikes", name: "Demon Spikes",   icon: icon("ability_demonhunter_demonspikes"), categories: ["defensive"] },
        { id: "dh_soulcleave",name: "Soul Cleave",    icon: icon("ability_demonhunter_soulcleave"),  categories: ["self_heal"] },
      ]},
    ],
  },
  {
    id: "evoker",
    name: "Evoker",
    color: "#33937F",
    shared: [
      { id: "evo_quell",     name: "Quell",           icon: icon("ability_evoker_quell"),            categories: ["interrupt"] },
      { id: "evo_obsidscales",name:"Obsidian Scales", icon: icon("ability_evoker_obsidianscales"),   categories: ["defensive"] },
      { id: "evo_renewingblaze",name:"Renewing Blaze",icon: icon("ability_evoker_renewingblaze"),    categories: ["self_heal"] },
      { id: "evo_hover",     name: "Hover",           icon: icon("ability_evoker_hover"),            categories: ["movement"] },
      { id: "evo_wingbuffet",name: "Wing Buffet",     icon: icon("ability_evoker_wingbuffet"),       categories: ["utility_2"] },
      { id: "evo_sleepwalk", name: "Sleep Walk",      icon: icon("ability_evoker_sleepwalk"),        categories: ["cc"] },
      { id: "evo_tailswipe", name: "Tail Swipe",      icon: icon("ability_evoker_tailswipe"),        categories: ["stun"] },
      { id: "evo_expunge",   name: "Expunge",         icon: icon("ability_evoker_green_01"),         categories: ["dispel"] },
      { id: "evo_zephyr",    name: "Zephyr",          icon: icon("ability_evoker_masterylifebinder_green"), categories: ["raid_cd"] },
    ],
    specs: [
      { id: "devastation", name: "Devastation", spells: [
        { id: "evo_dragrage", name: "Dragonrage",     icon: icon("ability_evoker_dragonrage"),       categories: ["major_cd"] },
        { id: "evo_firebreath",name:"Fire Breath",    icon: icon("ability_evoker_firebreath"),       categories: ["burst_cd", "aoe_dmg"] },
      ]},
      { id: "preservation", name: "Preservation", spells: [
        { id: "evo_rewind",   name: "Rewind",         icon: icon("ability_evoker_rewind"),           categories: ["raid_cd"] },
        { id: "evo_stasis",   name: "Stasis",         icon: icon("ability_evoker_stasis"),           categories: ["major_cd"] },
      ]},
      { id: "augmentation", name: "Augmentation", spells: [
        { id: "evo_breathchaos",name:"Breath of Eons",icon: icon("ability_evoker_breathofeons"),     categories: ["major_cd"] },
        { id: "evo_ebon",     name: "Ebon Might",     icon: icon("ability_evoker_ebonmight"),        categories: ["burst_cd"] },
      ]},
    ],
  },
];

export const CLASS_MAP = Object.fromEntries(CLASSES.map((c) => [c.id, c]));

export function getClassSpells(classId: string, specId: string): Spell[] {
  const cls = CLASS_MAP[classId];
  if (!cls) return [];
  const spec = cls.specs.find((s) => s.id === specId);
  return [...cls.shared, ...(spec?.spells ?? [])];
}

export const ICON_BASE = "https://wow.zamimg.com/images/wow/icons/large/";
export const iconUrl = (icon: string) => `${ICON_BASE}${icon}.jpg`;
