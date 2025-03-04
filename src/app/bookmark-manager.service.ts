/**
 * @licence
 * Copyright (c) 2021, ッツ Reader Authors
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { ScrollInformationService } from './scroll-information.service';

@Injectable({
  providedIn: 'root'
})
export class BookmarkManagerService {

  identifier = NaN;
  readonly el: HTMLElement;

  constructor(
    private databaseService: DatabaseService,
    private scrollInformationService: ScrollInformationService,
  ) {
    this.el = document.createElement('div');
    this.el.classList.add('bookmark-cover');
    this.el.hidden = true;
  }

  async scrollToSavedPosition() {
    const targetScrollX = await this.getBookmarkPosition();
    if (targetScrollX !== undefined) {
      window.scrollTo(targetScrollX, 0);
      this.el.style.right = `${-targetScrollX}px`;
      this.el.hidden = false;
    }
  }

  async saveScrollPosition() {
    const db = await this.databaseService.db;
    void db.put('bookmark', {
      dataId: this.identifier,
      scrollX: window.scrollX,
      exploredCharCount: this.scrollInformationService.exploredCharCount,
    });
    this.el.style.right = `${-window.scrollX}px`;
    this.el.hidden = false;
  }

  async refreshBookmarkBarPosition() {
    const targetScrollX = await this.getBookmarkPosition();
    if (targetScrollX !== undefined) {
      this.el.style.right = `${-targetScrollX}px`;
    }
  }

  private async getBookmarkPosition() {
    const db = await this.databaseService.db;
    const bookmark = await db.get('bookmark', this.identifier);
    if (bookmark) {
      let targetScrollX: number;
      if (bookmark.exploredCharCount) {
        if (this.scrollInformationService.getCharCount(Math.abs(bookmark.scrollX)) === bookmark.exploredCharCount) {
          targetScrollX = bookmark.scrollX;
        } else {
          targetScrollX = this.scrollInformationService.getScrollPos(bookmark.exploredCharCount);
        }
      } else {
        targetScrollX = bookmark.scrollX;
      }
      return targetScrollX;
    }
    return undefined;
  }
}
