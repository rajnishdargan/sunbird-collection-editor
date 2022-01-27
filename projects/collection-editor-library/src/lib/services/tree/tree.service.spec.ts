import { editorConfig, nativeElement } from './../../components/editor/editor.component.spec.data';
import { TestBed, inject } from '@angular/core/testing';
import { TreeService } from './tree.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { treeNode } from './tree.service.spec.data';

describe('TreeService', () => {
  let treeService: TreeService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [HttpClient]
    });

    treeService = TestBed.get(TreeService);
    treeService.initialize(editorConfig);
  });

  it('should be created', () => {
    const service: TreeService = TestBed.get(TreeService);
    expect(service).toBeTruthy();
  });

  it('Verify #setTreeElement()', ()=> {
    treeService.setTreeElement(nativeElement);
    expect(treeService.treeNativeElement).toEqual(nativeElement);
  })

  it('#updateNode() should call #setNodeTitle() and #updateTreeNodeMetadata()', ()=> {
    const metadata = {
      name : 'test'
    };
    spyOn(treeService, 'setNodeTitle');
    spyOn(treeService, 'updateTreeNodeMetadata');
    treeService.updateNode(metadata,'','Observation');
    treeService.updateTreeNodeMetadata(treeNode,undefined,'Observation');
    expect(treeService.setNodeTitle).toHaveBeenCalled();
    expect(treeService.updateTreeNodeMetadata).toHaveBeenCalled();
  })

  it("#updateAppIcon() should call #getActiveNode()", ()=> {
    spyOn(treeService, 'getActiveNode').and.callFake(()=> {
      return treeNode;
    });
    spyOn(treeService, 'setTreeCache').and.callFake(()=> {});
    treeService.updateAppIcon('https://dev.sunbirded.org/assets/images/sunbird_logo.png')
    expect(treeService.getActiveNode).toHaveBeenCalled();
  })

  it('#updateMetaDataProperty() should call #getFirstChild() and #setTreeCache()', ()=> {
    spyOn(treeService, 'getFirstChild').and.callFake(()=> treeNode);
    spyOn(treeService, 'setTreeCache');
    treeService.updateMetaDataProperty('maxScore', 2);
    expect(treeService.getFirstChild).toHaveBeenCalled();
    expect(treeService.setTreeCache).toHaveBeenCalled();
  });

  it("#updateTreeNodeMetadata() should call #setTreeCache()", ()=> {
    spyOn(treeService, 'getActiveNode').and.callFake(()=> treeNode);
    spyOn(treeService, 'setTreeCache');
    treeService.updateTreeNodeMetadata(treeNode);
    expect(treeService.setTreeCache).toHaveBeenCalled();
  })

  it("#updateTreeNodeMetadata() should call #setTreeCache() with primaryCategory", ()=> {
    spyOn(treeService, 'getActiveNode').and.callFake(()=> treeNode);
    spyOn(treeService, 'getNodeById');
    spyOn(treeService, 'setTreeCache');
    treeService.updateTreeNodeMetadata(treeNode,undefined,'Observation');
    expect(treeService.setTreeCache).toHaveBeenCalled();
  })

  it("#getNodeById() should call", ()=> {
    spyOn(treeService, 'getNodeById');
    spyOn(treeService,'getTreeObject').and.callThrough();
    treeService.getNodeById('do_123');
    expect(treeService.getNodeById).toHaveBeenCalled();
  });

  it("#getParent() should call", ()=> {
    spyOn(treeService, 'getActiveNode').and.callFake(()=> {});
    spyOn(treeService, 'getNodeById');
    spyOn(treeService,'getFirstChild');
    treeService.getParent();
  });
  
  it("#removeSpecialChars() should remove special characters from string", ()=> {
    let string = "test@ioo!$%#";
    const result = treeService.removeSpecialChars(string);
    expect(result).toEqual('testioo');
  })
});
