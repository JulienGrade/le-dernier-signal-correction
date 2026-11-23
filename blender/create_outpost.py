"""Recrée les assets originaux du Dernier signal. Blender 3.4+.
Exécution : blender --background --python blender/create_outpost.py
"""
import bpy, math, random
from pathlib import Path
from mathutils import Vector
random.seed(24)
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def mat(name,color,metal=.0,rough=.5,emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 if emission:
  inp=bs.inputs.get('Emission Color') or bs.inputs.get('Emission');inp.default_value=(*color,1)
  bs.inputs['Emission Strength'].default_value=emission
 return m
rock=mat('Asteroid_Slate',(.12,.16,.23),.1,.92)
white=mat('Station_Ceramic',(.79,.85,.89),.3,.35)
dark=mat('Station_Graphite',(.035,.055,.09),.6,.4)
orange=mat('Station_Orange',(.98,.30,.06),.3,.4)
blue=mat('Solar_Cells',(.025,.12,.36),.7,.24)
glass=mat('Window_Cyan',(.08,.66,.91),.4,.18,.8)
metal=mat('Antenna_Titanium',(.55,.66,.76),.75,.27)

def empty(name,loc=(0,0,0),parent=None):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=parent;o.location=loc;return o

def cube(name,loc,scale,material,parent=None,bevel=.05):
 bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.name=name;o.parent=parent;o.location=loc;o.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Edges','BEVEL');mod.width=bevel;mod.segments=2
  o.modifiers.new('Normals','WEIGHTED_NORMAL')
 o.data.materials.append(material);return o

def cyl(name,loc,radius,depth,material,parent=None,vertices=16):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth);o=bpy.context.object;o.name=name;o.parent=parent;o.location=loc;o.data.materials.append(material);return o

root=empty('Outpost')
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1)
a=bpy.context.object;a.name='Asteroid';a.parent=root
for v in a.data.vertices:
 v.co.x*=4.8*(1+random.uniform(-.12,.12));v.co.y*=3.7*(1+random.uniform(-.12,.12))
 v.co.z=0 if v.co.z>.22 else (v.co.z-.22)*2.3
a.data.materials.append(rock)
# Strates, rochers et cristaux sur le socle.
for i in range(16):
 angle=i*2.399;r=random.uniform(2.6,4)
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=random.uniform(.15,.45));o=bpy.context.object;o.name=f'Rock_{i:02}';o.parent=root;o.location=(math.cos(angle)*r,math.sin(angle)*r*.73,.02);o.scale.z=.6;o.data.materials.append(rock)
platform=cyl('Landing_Pad',(0,0,.13),2.05,.2,dark,root,48)
cyl('Pad_Trim',(0,0,.25),1.94,.05,orange,root,48)
cyl('Pad_Surface',(0,0,.30),1.85,.06,white,root,48)
for x in [-.85,.85]:
 for y in [-.6,.6]:cyl('Station_Leg',(x,y,.65),.12,.65,metal,root)
cube('Habitat',(0,0,1.25),(2.25,1.65,1.25),white,root,.19)
cube('Roof',(0,0,1.94),(2.38,1.78,.18),dark,root,.08)
cube('Front_Window',(0,-.838,1.45),(1.45,.04,.40),glass,root,.06)
cube('Front_Stripe',(0,-.865,.98),(2.1,.04,.11),orange,root,.02)
cube('Airlock',(1.14,0,1.16),(.09,.70,.85),dark,root,.06)
for j in range(3):cube(f'Step_{j}',(1.50+j*.23,0,.62-j*.13),(.45,.85,.15),metal,root,.025)
# Panneaux, cellules et supports.
for side in [-1,1]:
 solar=empty(f'Solar_{side}',(side*2.5,.55,1.15),root);solar.rotation_euler[1]=side*.18
 cyl('Solar_Mast',(0,0,-.55),.08,1.1,metal,solar)
 cube('Solar_Frame',(0,0,0),(1.50,2.15,.09),metal,solar,.025)
 for x in range(3):
  for y in range(5):cube('Solar_Cell',((x-1)*.46,(y-2)*.40,.055),(.42,.36,.035),blue,solar,.008)
# L'axe local Z de Blender devient l'axe Y dans glTF.
cyl('Antenna_Mast',(0,.2,2.25),.12,.5,metal,root)
pivot=empty('Pivot_Antenna',(0,.2,2.52),root)
# Parabole en anneaux, ouverte vers +Z puis inclinée.
dish=empty('Dish_Tilt',(0,0,0),pivot);dish.rotation_euler[0]=math.radians(28)
verts=[(0,0,0)];faces=[]
for ring in range(1,7):
 r=ring*.16
 for s in range(48):
  angle=s*math.tau/48;verts.append((r*math.cos(angle),r*math.sin(angle),r*r*.42))
for s in range(48):faces.append((0,1+s,1+(s+1)%48))
for ring in range(5):
 for s in range(48):
  x=1+ring*48+s;nx=1+ring*48+(s+1)%48;faces.append((x,x+48,nx+48,nx))
me=bpy.data.meshes.new('DishMesh');me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new('Dish',me);bpy.context.collection.objects.link(ob);ob.parent=dish;ob.data.materials.append(white)
sol=ob.modifiers.new('Shell','SOLIDIFY');sol.thickness=.035
for s in range(3):
 angle=s*math.tau/3;arm=cube('Feed_Arm',(.42*math.cos(angle),.42*math.sin(angle),.48),(.035,.035,.9),metal,dish,.01);arm.rotation_euler=(.3*math.sin(angle),-.3*math.cos(angle),0)
cyl('Feed',(0,0,.94),.11,.25,orange,dish)
# Chaque relais possède son propre matériau de coeur.
for i,loc in enumerate([(-2.7,-1.45,.12),(2.75,-1.30,.12),(.7,2.3,.12)],1):
 relay=empty(f'Relay_{i:02}',loc,root)
 cyl(f'Relay_{i:02}_Base',(0,0,.12),.45,.24,dark,relay)
 cyl(f'Relay_{i:02}_Housing',(0,0,.5),.26,.65,metal,relay)
 coremat=mat(f'Relay_{i:02}_Glow',(.07,.85,.95),.1,.25,.12)
 cyl(f'Relay_{i:02}_Core',(0,0,.57),.285,.37,coremat,relay)
 cyl(f'Relay_{i:02}_Cap',(0,0,.84),.35,.13,orange,relay)
 cyl(f'Relay_{i:02}_Aerial',(0,0,1.10),.025,.43,metal,relay)
 for x in [-.33,.33]:cube('Relay_Guard',(x,0,.53),(.07,.09,.72),dark,relay,.015)
# Export : uniquement le modèle ; pas de caméra ni de lumière.
bpy.ops.object.select_all(action='DESELECT')
for obj in [root,*root.children_recursive]:obj.select_set(True)
bpy.context.view_layer.objects.active=root
(ROOT/'assets').mkdir(exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'assets/outpost.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
# Caméra d'atelier et éclairage pour le fichier Blender.
bpy.ops.object.camera_add(location=(10,-14,10));camera=bpy.context.object;camera.name='Workshop_Camera';camera.rotation_euler=(Vector((0,0,.5))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=14;bpy.context.scene.camera=camera
for loc,power,size in [((3,-5,9),1400,7),((-5,1,5),1100,6)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(Vector((0,0,0))-l.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE_NEXT' if bpy.app.version >= (4,2,0) else 'BLENDER_EEVEE';scene.world.color=(.025,.035,.06);scene.render.resolution_x=1440;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/outpost.blend'))
print('OUTPOST_READY')
