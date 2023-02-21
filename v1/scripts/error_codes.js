/*
 *   ExplodingAU Website - The website for ExplodingAU
 *   Copyright (C) 2023  ExplodingBottle
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const PING_MALFORMED_SIZE = 4000001;
const PING_MALFORMED_PONG = 4000002;
const PING_VERSION_MISMATCH = 4000003;

const UPD_CHECK_ALREADY_SCANNING = 4100001;

const UPD_STATUS_NOT_SCANNING = 4200001;

const UPD_RECEIVE_NO_PACKAGES = 4300001;
const UPD_RECEIVE_FAIL = 4300002;

const UPD_INSTALL_NO_PACKAGES = 4400001;

const AGNT_INTERRUPT_UNKNWN = 4600001;

const PING_CON_ERROR = 2000001;
const PING_CON_ABORT = 2000002;
const PING_CON_TIMEOUT = 2000003;
const UPD_CHECK_CON_ERROR = 2100001;
const UPD_CHECK_CON_ABORT = 2100002;
const UPD_CHECK_CON_TIMEOUT = 2100003;
const UPD_STATUS_CON_ERROR = 2200001;
const UPD_STATUS_CON_ABORT = 2200002;
const UPD_STATUS_CON_TIMEOUT = 2200003;
const UPD_RECEIVE_CON_ERROR = 2300001;
const UPD_RECEIVE_CON_ABORT = 2300002;
const UPD_RECEIVE_CON_TIMEOUT = 2300003;
const UPD_INSTALL_CON_ERROR = 2400001;
const UPD_INSTALL_CON_ABORT = 2400002;
const UPD_INSTALL_CON_TIMEOUT = 2400003;
const UPD_INSTALL_RES_CON_ERROR = 2500001;
const UPD_INSTALL_RES_CON_ABORT = 2500002;
const UPD_INSTALL_RES_CON_TIMEOUT = 2500003;
const AGNT_INTERRUPT_CON_ERROR = 2600001;
const AGNT_INTERRUPT_RES_CON_ABORT = 2600002;
const AGNT_INTERRUPT_RES_CON_TIMEOUT = 2600003;

const NO_ERROR = 0;
const RETRY_NON_FATAL = 1;
