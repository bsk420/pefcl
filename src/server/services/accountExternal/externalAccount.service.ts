import { singleton } from 'tsyringe';
import { Request } from '@typings/http';
import { ExternalAccount } from '@typings/Account';
import { UserService } from '../user/user.service';
import { mainLogger } from '../../sv_logger';
import { ExternalAccountDB } from './externalAccount.db';
import { ExternalAccountErrors, GenericErrors } from '@typings/Errors';
import { ServerError } from '@utils/errors';
import { AccountDB } from 'services/account/account.db';

const logger = mainLogger.child({ module: 'externalAccounts' });

@singleton()
export class ExternalAccountService {
  _externalAccountDB: ExternalAccountDB;
  _userService: UserService;
  _accountDB: AccountDB;

  constructor(
    externalAccountDB: ExternalAccountDB,
    userService: UserService,
    accountDB: AccountDB,
  ) {
    this._externalAccountDB = externalAccountDB;
    this._userService = userService;
    this._accountDB = accountDB;
  }

  async addAddAccount(req: Request<ExternalAccount>) {
    logger.silly('Creating external account');

    const user = this._userService.getUser(req.source);
    const targetAccount = await this._accountDB.getAccountByNumber(req.data.number);
    const alreadyExists = await this._externalAccountDB.getExistingAccount(
      user.getIdentifier(),
      req.data.number,
    );

    if (!targetAccount) {
      logger.silly('No matching base account found.');
      logger.silly(req.data);
      throw new ServerError(GenericErrors.NotFound);
    }

    if (alreadyExists) {
      logger.silly('Account with number & userId already exists.');
      logger.silly(req.data);
      throw new ServerError(ExternalAccountErrors.AccountAlreadyExists);
    }

    return this._externalAccountDB.create({
      name: req.data.name,
      number: req.data.number,
      userId: user.getIdentifier(),
    });
  }

  async getAccounts(req: Request<void>) {
    const user = this._userService.getUser(req.source);
    return this._externalAccountDB.getAccountsByUserId(user.getIdentifier());
  }

  async getAccountFromExternalAccount(accountId: number) {
    const externalAccount = await this._externalAccountDB.getAccountById(accountId);
    const account = await this._accountDB.getAccountByNumber(
      externalAccount.getDataValue('number'),
    );
    return account;
  }
}
