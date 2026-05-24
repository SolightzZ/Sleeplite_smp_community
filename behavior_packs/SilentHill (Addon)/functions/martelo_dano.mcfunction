playsound mob.zombie.woodbreak @a ~~~ 900 0.5
playsound mace.heavy_smash_ground @a ~~~ 900 1
execute as @e[family=monster,r=5] at @s run teleport @s ^^1^-2 facing @s
effect @e[family=monster,r=5] slowness 2 4 true
particle minecraft:knockback_roar_particle ~~1~
damage @e[family=monster,r=5] 20 fire
camerashake add @p[r=2] 0.5 1 positional