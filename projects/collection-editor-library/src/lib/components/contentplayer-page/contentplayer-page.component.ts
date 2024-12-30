import { Component, ElementRef, Input, OnInit, ViewChild, OnChanges, ViewEncapsulation, AfterViewInit } from '@angular/core';
import * as _ from 'lodash-es';
import { EditorService } from '../../services/editor/editor.service';
import { PlayerService } from '../../services/player/player.service';
import { ConfigService } from '../../services/config/config.service';
declare var $: any;

@Component({
  selector: 'lib-contentplayer-page',
  templateUrl: './contentplayer-page.component.html',
  styleUrls: ['./contentplayer-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ContentplayerPageComponent implements OnInit, OnChanges {
  @ViewChild('contentIframe') contentIframe: ElementRef;
  @ViewChild("pdfPlayer") pdfPlayer: ElementRef;
  @ViewChild("epubPlayer") epubPlayer: ElementRef;
  @ViewChild("videoPlayer") videoPlayer: ElementRef;
  @Input() contentMetadata: any;
  @Input() contentDataConfig: any;
  public contentDetails: any;
  public playerConfig: any;
  public content: any;
  public playerType: string;
  public contentId: string;
  constructor(private editorService: EditorService, private playerService: PlayerService,
    public configService: ConfigService) { }

  ngOnInit() { }

  ngOnChanges() {
    this.contentMetadata = _.get(this.contentMetadata, 'data.metadata') || this.contentMetadata;
    if (this.contentId !== this.contentMetadata.identifier) {
      this.contentId = this.contentMetadata.identifier;
      this.getContentDetails();
    }
  }

  getContentDetails() {
    this.playerType = 'default-player';
    this.editorService.fetchContentDetails(this.contentId).subscribe(res => {
      this.contentDetails = {
        contentId: this.contentId,
        contentData: _.get(res, 'result.content')
      };
      this.playerConfig = this.playerService.getPlayerConfig(this.contentDetails);
      this.setPlayerType();
      if (this.playerType === 'default-player') {
        this.loadDefaultPlayer()
      } else {
        this.playerConfig.config = {
          'traceId': 'afhjgh',
          'sideMenu': {
            'showDownload': true,
            'showExit': true,
            'showPrint': true,
            'showReplay': true,
            'showShare': true
          }
        };
        this.loadPlayer()
      }

    });
  }

  setPlayerType() {
    const playerType = _.get(this.configService.playerConfig, 'playerType');
    _.forIn(playerType, (value, key) => {
      if (value.length) {
        if (_.includes(value, _.get(this.contentDetails, 'contentData.mimeType'))) {
          this.playerType = key;
        }
      }
    });
  }

  loadDefaultPlayer() {
    // const iFrameSrc = this.configService.appConfig.PLAYER_CONFIG.baseURL + '&build_number=' + this.buildNumber;
    const iFrameSrc = `/content/preview/preview.html?webview=true&build_number=2.8.0.e552fcd`;
    setTimeout(() => {
      const playerElement = this.contentIframe.nativeElement;
      playerElement.src = iFrameSrc;
      playerElement.onload = (event) => {
        try {
          this.adjustPlayerHeight();
          // this.playerLoaded = true;
          playerElement.contentWindow.initializePreview(this.playerConfig);
          // playerElement.addEventListener('renderer:telemetry:event', telemetryEvent => this.generateContentReadEvent(telemetryEvent));
          // window.frames['contentPlayer'].addEventListener('message', accessEvent => this.generateScoreSubmitEvent(accessEvent), false);
        } catch (err) {
          console.log('loading default player failed', err);
          // const prevUrls = this.navigationHelperService.history;
          // if (this.isCdnWorking.toLowerCase() === 'yes' && prevUrls[prevUrls.length - 2]) {
          //   history.back();
          // }
        }
      };
    }, 0);
  }

  /**
   * Adjust player height after load
   */
  adjustPlayerHeight() {
    const playerWidth = $('#contentPlayer').width();
    if (playerWidth) {
      const height = playerWidth * (9 / 16);
      $('#contentPlayer').css('height', height + 'px');
    }
  }

  eventHandler(e) { }

  generateContentReadEvent(e, state?) { }

  setPlayerProperties(playerElement: any) {
    playerElement.setAttribute('player-config', JSON.stringify(this.playerConfig));
    playerElement.addEventListener('playerEvent', this.eventHandler);
    playerElement.addEventListener('telemetryEvent', this.generateContentReadEvent);
  }

  loadPlayer() {
    setTimeout(() => {
      if (this.playerType === "pdf-player") {
        const pdfElement = document.createElement('sunbird-pdf-player');
        this.setPlayerProperties(pdfElement)
        this.pdfPlayer.nativeElement.append(pdfElement);
      } else if (this.playerType === "epub-player") {
        const epubElement = document.createElement('sunbird-epub-player');
        this.setPlayerProperties(epubElement)
        this.epubPlayer.nativeElement.append(epubElement);
      }else if (this.playerType === "video-player") {
        const videoElement = document.createElement('sunbird-video-player');
        this.setPlayerProperties(videoElement)
        this.videoPlayer.nativeElement.append(videoElement);
      }
    }, 500)
  }

  getColumnClass(index: number): string {
    console.log("index ===>", index);
    if (index % 3 === 0) {
      return 'six wide column';
    } else if (index % 3 === 1) {
      return 'four wide column';
    } else {
      return 'two wide column';
    }
  }
}
